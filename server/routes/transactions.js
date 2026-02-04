import express from 'express';
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions for an account
router.get('/account/:accountId', async (req, res) => {
  const { accountId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE from_account_id = $1 OR to_account_id = $1 
       ORDER BY created_at DESC`,
      [accountId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction (expense, transfer, or credit card payment)
router.post('/', async (req, res) => {
  const { from_account_id, to_account_id, amount, type, description, category } = req.body;

  if (!amount || !type || !from_account_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Only consider to_account_id for transfer / credit_payment; otherwise keep null
  const toAccountId = (type === 'transfer' || type === 'credit_payment')
    ? (to_account_id && to_account_id !== '' ? to_account_id : null)
    : null;

  // For types that require a destination account, validate presence
  if ((type === 'transfer' || type === 'credit_payment') && !toAccountId) {
    return res.status(400).json({ error: 'Destination account id is required for this transaction type' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create transaction record (use null for to_account_id when absent)
    const txResult = await client.query(
      `INSERT INTO transactions 
       (from_account_id, to_account_id, amount, type, description, category) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [from_account_id, toAccountId, amount, type, description, category]
    );

    const transaction = txResult.rows[0];

    // Update account balances based on transaction type
    if (type === 'expense') {
      // Deduct from expense account (e.g., cash or bank)
      const accountCheckResult = await client.query(
        'SELECT balance FROM accounts WHERE id = $1',
        [from_account_id]
      );
      const newBalance = parseFloat(accountCheckResult.rows[0].balance) - amount;
      if (newBalance < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient funds: transaction would result in negative balance' });
      }

      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [amount, from_account_id]
      );

      // Create expense record
      await client.query(
        `INSERT INTO expenses (account_id, description, amount, category, expense_date)
         VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
        [from_account_id, description, amount, category]
      );
    } else if (type === 'transfer') {
      // Transfer between accounts
      const accountCheckResult = await client.query(
        'SELECT balance FROM accounts WHERE id = $1',
        [from_account_id]
      );
      const newBalance = parseFloat(accountCheckResult.rows[0].balance) - amount;
      if (newBalance < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient funds: transaction would result in negative balance' });
      }

      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [amount, from_account_id]
      );
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [amount, toAccountId]
      );
    } else if (type === 'credit_payment') {
      // Pay credit card from bank/cash
      const accountCheckResult = await client.query(
        'SELECT balance FROM accounts WHERE id = $1',
        [from_account_id]
      );
      const newBalance = parseFloat(accountCheckResult.rows[0].balance) - amount;
      if (newBalance < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient funds: transaction would result in negative balance' });
      }

      // Deduct from bank/cash
      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [amount, from_account_id]
      );
      // Reduce credit card bill (increase balance)
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [amount, toAccountId]
      );

      // Also create expense record for this payment
      await client.query(
        `INSERT INTO expenses (account_id, description, amount, category, expense_date)
         VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
        [from_account_id, `Credit Card Payment: ${description}`, amount, 'credit_payment']
      );
    } else if (type === 'income') {
      // Add income to account
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [amount, from_account_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(transaction);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get transaction details
    const txResult = await client.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );

    if (txResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = txResult.rows[0];

    // Reverse the transaction
    if (transaction.type === 'expense') {
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [transaction.amount, transaction.from_account_id]
      );
    } else if (transaction.type === 'transfer') {
      // Check if reversal would make source account negative
      const sourceCheckResult = await client.query(
        'SELECT balance FROM accounts WHERE id = $1',
        [transaction.from_account_id]
      );
      const newSourceBalance = parseFloat(sourceCheckResult.rows[0].balance) + transaction.amount;
      if (newSourceBalance < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cannot reverse: would result in negative balance' });
      }
      
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [transaction.amount, transaction.from_account_id]
      );
      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [transaction.amount, transaction.to_account_id]
      );
    } else if (transaction.type === 'credit_payment') {
      const sourceCheckResult = await client.query(
        'SELECT balance FROM accounts WHERE id = $1',
        [transaction.from_account_id]
      );
      const newSourceBalance = parseFloat(sourceCheckResult.rows[0].balance) + transaction.amount;
      if (newSourceBalance < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cannot reverse: would result in negative balance' });
      }

      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [transaction.amount, transaction.from_account_id]
      );
      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [transaction.amount, transaction.to_account_id]
      );
    } else if (transaction.type === 'income') {
      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [transaction.amount, transaction.from_account_id]
      );
    }

    // Delete related expenses
    await client.query(
      'DELETE FROM expenses WHERE description LIKE $1 OR description LIKE $2',
      [`%${transaction.description}%`, `Credit Card Payment: ${transaction.description}`]
    );

    // Delete transaction
    await client.query('DELETE FROM transactions WHERE id = $1', [id]);

    await client.query('COMMIT');
    res.json({ message: 'Transaction deleted and balances reversed' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;
