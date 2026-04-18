'use strict';

const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

app.post('/api/contact', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();
  const service = String(req.body.service || '').trim();
  const message = String(req.body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ error: 'SMTP is not configured.' });
  }

  const receiver = process.env.CONTACT_RECEIVER || 'adeil.eltigani@gmail.com';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = `EQAD Contact Form: ${service || 'General Inquiry'}`;

  const textBody = [
    'New contact form submission from eqad website',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Service: ${service || 'Not selected'}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const htmlBody = `
    <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#1d2738">
      <h2 style="margin:0 0 12px">New Contact Form Submission</h2>
      <p style="margin:0 0 8px"><strong>Name:</strong> ${name}</p>
      <p style="margin:0 0 8px"><strong>Email:</strong> ${email}</p>
      <p style="margin:0 0 8px"><strong>Service:</strong> ${service || 'Not selected'}</p>
      <p style="margin:14px 0 6px"><strong>Message:</strong></p>
      <p style="margin:0;white-space:pre-wrap">${message}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"EQAD Website" <${process.env.SMTP_USER}>`,
      to: receiver,
      replyTo: email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Email send failed:', error);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`EQAD server is running on http://localhost:${port}`);
});
