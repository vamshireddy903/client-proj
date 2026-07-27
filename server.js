require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Middleware
app.use(cors());
app.use(express.json());
// Only serve the public/ folder (index.html, css, js, images) — NOT server.js,
// package.json, .env, etc. Serving __dirname directly would expose backend source.
app.use(express.static(PUBLIC_DIR));

// MySQL Connection Pool
let pool;

async function initDB() {
  try {
    // First connect without database to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'builtrise_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    // Now create the pool connected to the specific database
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_name VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure message column exists in case table was already created
    try {
      await pool.query('ALTER TABLE quotes ADD COLUMN message TEXT;');
    } catch (e) {
      // Column already exists, ignore error
    }

    console.log(`✅ Connected to MySQL database: ${dbName}`);
  } catch (error) {
    console.error('❌ Database connection failed. Please ensure MySQL is running.', error.message);
  }
}

// Initialize Database
initDB();

// Guard: if the DB pool isn't ready yet (e.g. MySQL container still starting),
// fail cleanly instead of throwing on pool.query().
function requireDB(req, res, next) {
  if (!pool) {
    return res.status(503).json({ error: 'Service temporarily unavailable. Please try again in a moment.' });
  }
  next();
}

// Basic validation helpers
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

// Escape HTML special characters before interpolating user input into email HTML
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Email Transporter Config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'builtriseengineers@gmail.com';

// API Endpoints
app.post('/api/contact', requireDB, async (req, res) => {
  const { name, email, phone, message, source } = req.body;
  const formLabel = source && String(source).trim() ? String(source).trim() : 'Contact';

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!PHONE_RE.test(phone)) {
    return res.status(400).json({ error: 'Please provide a valid phone number.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email || 'N/A', phone, message || '']
    );

    // Notify the business owner by email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: OWNER_EMAIL,
        subject: `New "${formLabel}" Submission from ${name}`,
        html: `
          <h2>New "${escapeHtml(formLabel)}" Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email || 'N/A')}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message || 'No additional details provided.')}</p>
        `
      });
      console.log('Contact notification email sent successfully.');
    } catch (emailError) {
      // Don't fail the request just because the email didn't send — the
      // submission is already safely stored in MySQL.
      console.error('Failed to send contact notification email:', emailError);
    }

    res.status(201).json({ success: true, id: result.insertId, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/quote', requireDB, async (req, res) => {
  const { package_name, name, phone, message } = req.body;

  if (!package_name || !name || !phone) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!PHONE_RE.test(phone)) {
    return res.status(400).json({ error: 'Please provide a valid phone number.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO quotes (package_name, name, phone, message) VALUES (?, ?, ?, ?)',
      [package_name, name, phone, message || '']
    );

    // Send Email to Owner
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: OWNER_EMAIL,
        subject: `New Quotation Request: ${package_name}`,
        html: `
          <h2>New Quotation Request</h2>
          <p><strong>Package:</strong> ${escapeHtml(package_name)}</p>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>WhatsApp Number:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Requirement Details:</strong></p>
          <p>${escapeHtml(message || 'No additional details provided.')}</p>
        `
      });
      console.log('Quotation email sent successfully.');
    } catch (emailError) {
      console.error('Failed to send quotation email:', emailError);
    }

    res.status(201).json({ success: true, id: result.insertId, message: 'Quote request submitted!' });
  } catch (error) {
    console.error('Quote submit error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Fallback to index.html for any other GET route (client-side routing / direct links)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  } else {
    next();
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
