import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenses by date range
router.get('/range/:startDate/:endDate', async (req, res) => {
  const { startDate, endDate } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM expenses 
       WHERE expense_date >= $1 AND expense_date <= $2 
       ORDER BY expense_date DESC`,
      [startDate, endDate]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenses by category
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE category = $1 ORDER BY expense_date DESC',
      [category]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
