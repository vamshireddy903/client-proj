require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '')));
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Multer Config
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// API Endpoints
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  try {
    let insertId = null;

    // Send Email to Owner
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'vamsir673@gmail.com',
        subject: `New Contact/Project Request: ${name}`,
        html: `
          <h2>New Contact/Project Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message/Details:</strong></p>
          <p>${message || 'No additional details provided.'}</p>
        `
      });
      console.log('Contact email sent successfully.');
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError);
    }

    res.status(201).json({ success: true, id: insertId, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/quote', async (req, res) => {
  const { package_name, name, phone, message } = req.body;
  
  if (!package_name || !name || !phone) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    let insertId = null;

    // Send Email to Owner
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'vamsir673@gmail.com',
        subject: `New Quotation Request: ${package_name}`,
        html: `
          <h2>New Quotation Request</h2>
          <p><strong>Package:</strong> ${package_name}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>WhatsApp Number:</strong> ${phone}</p>
          <p><strong>Requirement Details:</strong></p>
          <p>${message || 'No additional details provided.'}</p>
        `
      });
      console.log('Quotation email sent successfully.');
    } catch (emailError) {
      console.error('Failed to send quotation email:', emailError);
    }

    res.status(201).json({ success: true, id: insertId, message: 'Quote request submitted!' });
  } catch (error) {
    console.error('Quote submit error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/video', upload.single('video'), async (req, res) => {
  const { name, email } = req.body;
  const file = req.file;

  if (!name || !email || !file) {
    return res.status(400).json({ error: 'Name, email, and video file are required.' });
  }

  try {
    let insertId = null;

    // Send Email to Owner with Attachment
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'vamsir673@gmail.com',
        subject: `New Video Upload: ${name}`,
        html: `
          <h2>New Video Uploaded</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>A new video has been uploaded and saved on the server at: ${file.path}</p>
        `,
        attachments: [
          {
            filename: file.originalname,
            path: file.path
          }
        ]
      });
      console.log('Video email sent successfully.');
    } catch (emailError) {
      console.error('Failed to send video email:', emailError);
    }

    res.status(201).json({ success: true, id: insertId, message: 'Video uploaded successfully!' });
  } catch (error) {
    console.error('Video submit error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Fallback to index.html for any other route
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    next();
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
