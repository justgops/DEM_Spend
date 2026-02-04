import express from 'express';
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM accounts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create account
router.post('/', async (req, res) => {
  const { name, type, balance = 0, credit_limit, due_date, statement_day } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO accounts (name, type, balance, credit_limit, due_date, statement_day) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, type, balance, credit_limit, due_date, statement_day]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update account
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, balance, credit_limit, due_date, statement_day } = req.body;

  try {
    const result = await pool.query(
      'UPDATE accounts SET name = $1, type = $2, balance = $3, credit_limit = $4, due_date = $5, statement_day = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [name, type, balance, credit_limit, due_date, statement_day, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete account
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM accounts WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
