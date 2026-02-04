import pool from './db.js';

export async function initializeDatabase() {
  try {
    // Ensure pgcrypto extension for gen_random_uuid()
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // Create accounts table (includes statement_day)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'cash', 'bank', 'credit_card'
        balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        credit_limit DECIMAL(12, 2), -- for credit cards
        due_date INTEGER, -- day of month for credit card due
        statement_day INTEGER, -- statement generation day
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure statement_day column exists for older installs
    await pool.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS statement_day INTEGER;`);

    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
        to_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
        amount DECIMAL(12, 2) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'expense', 'transfer', 'income', 'credit_payment'
        description VARCHAR(255),
        category VARCHAR(50), -- 'food', 'transport', etc
        related_expense_id UUID, -- links to expense if applicable
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create expenses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}
