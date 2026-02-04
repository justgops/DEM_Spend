import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/dem_spend'
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
