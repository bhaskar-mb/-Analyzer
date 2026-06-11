import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'github_analyzer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on file import to catch early errors
try {
  const connection = await pool.getConnection();
  console.log('Successfully connected to the MySQL database.');
  connection.release();
} catch (error) {
  console.error('Failed to connect to the MySQL database:', error.message);
}

export default pool;
