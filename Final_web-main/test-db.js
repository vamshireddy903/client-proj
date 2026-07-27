const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    console.log("Connecting with:", {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    console.log("✅ Successfully connected to MySQL!");
    await connection.end();
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
}

testConnection();
