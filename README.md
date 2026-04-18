# EQAD

## Contact Form Backend Setup

This project now includes a real backend endpoint that sends website contact messages to:

- `adeil.eltigani@gmail.com`

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env`, then set:

- `SMTP_USER`: your Gmail address used to send emails
- `SMTP_PASS`: Gmail App Password (16 characters)
- `CONTACT_RECEIVER`: `adeil.eltigani@gmail.com`

Example:

```env
PORT=3000
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-16-char-app-password
CONTACT_RECEIVER=adeil.eltigani@gmail.com
```

### 3) Start server

```bash
npm start
```

Open `http://localhost:3000`

### Notes

- Gmail requires 2-Step Verification and an App Password.
- The frontend sends contact form data to `POST /api/contact`.