require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const connectDB = require('./db/database');
const seed      = require('./db/seed');

const app = express();

// ── Connect MongoDB then seed ──────────────────────────────────
connectDB().then(() => seed().catch(console.error));

// ── Middleware ─────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static files ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // multer images

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/schemes',  require('./routes/schemes'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/doctors',  require('./routes/doctors'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/blog',     require('./routes/blog'));
app.use('/api/admin',    require('./routes/admin'));

// ── Public notices ─────────────────────────────────────────────
app.get('/api/notices', async (req, res) => {
  try {
    const Notice = require('./models/Notice');
    res.json(await Notice.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.json([]);
  }
});

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'AwadhMed v3.0 (MongoDB)', ts: new Date().toISOString() });
});

// ── SPA fallback ───────────────────────────────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
🏥 AwadhMed v3.0 (MongoDB) running on http://localhost:${PORT}
   Frontend:     http://localhost:${PORT}
   Schemes:      http://localhost:${PORT}/Schemes.html
   Admin Panel:  http://localhost:${PORT}/admin.html
   Auth:         http://localhost:${PORT}/auth.html
   Dashboard:    http://localhost:${PORT}/dashboard.html
   Health:       http://localhost:${PORT}/api/health

   Admin: ${process.env.ADMIN_EMAIL || 'anc@awadhmed.com'} / ${process.env.ADMIN_PASSWORD || 'DVWPA1283B'}
`);
});

module.exports = app;
