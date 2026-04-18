const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const auth     = require('../middleware/auth');
const upload   = require('../middleware/upload');
const User     = require('../models/User');
const Doctor   = require('../models/Doctor');
const Booking  = require('../models/Booking');
const Order    = require('../models/Order');
const Medicine = require('../models/Medicine');
const Blog     = require('../models/Blog');
const Notice   = require('../models/Notice');
const Scheme   = require('../models/Scheme');
const Contact  = require('../models/Contact');

// ── Stats ────────────────────────────────────────────────────────
router.get('/stats', auth(['admin']), async (req, res) => {
  try {
    const [users, doctors, bookings, orders, medicines, blog, contacts, schemes] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Booking.countDocuments({ status: { $ne: 'pending_payment' } }),
      Order.countDocuments({ status: { $ne: 'pending_payment' } }),
      Medicine.countDocuments(),
      Blog.countDocuments({ published: true }),
      Contact.countDocuments({ status: 'new' }),
      Scheme.countDocuments({ isActive: true }),
    ]);
    const paidBookings = await Booking.find({ status: { $in: ['confirmed','completed'] } });
    const bookingRevenue = paidBookings.reduce((s, b) => s + (b.amount || 0), 0);
    const paidOrders = await Order.find({ status: { $in: ['confirmed','shipped','delivered'] } });
    const orderRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
    res.json({ users, doctors, bookings, orders, medicines, blog, contacts, schemes, bookingRevenue, orderRevenue });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Users ────────────────────────────────────────────────────────
router.get('/users', auth(['admin']), async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-password -otpHash');
  res.json(users);
});
router.put('/users/:id', auth(['admin']), async (req, res) => {
  const { name, role, phone } = req.body;
  await User.findByIdAndUpdate(req.params.id, { name, role, phone });
  res.json({ message: 'Updated' });
});
router.delete('/users/:id', auth(['admin']), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Doctors ──────────────────────────────────────────────────────
router.get('/doctors', auth(['admin']), async (req, res) => {
  res.json(await Doctor.find().sort({ createdAt: -1 }));
});
router.post('/doctors', auth(['admin']), async (req, res) => {
  try {
    const doc = await Doctor.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add doctor' });
  }
});
router.put('/doctors/:id', auth(['admin']), async (req, res) => {
  await Doctor.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Updated' });
});
router.delete('/doctors/:id', auth(['admin']), async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Medicines ────────────────────────────────────────────────────
router.get('/medicines', auth(['admin']), async (req, res) => {
  res.json(await Medicine.find().sort({ name: 1 }));
});
router.post('/medicines', auth(['admin']), async (req, res) => {
  const med = await Medicine.create(req.body);
  res.status(201).json(med);
});
router.put('/medicines/:id', auth(['admin']), async (req, res) => {
  await Medicine.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Updated' });
});
router.delete('/medicines/:id', auth(['admin']), async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Schemes ──────────────────────────────────────────────────────
router.get('/schemes', auth(['admin']), async (req, res) => {
  res.json(await Scheme.find().sort({ createdAt: -1 }));
});
router.post('/schemes', auth(['admin']), upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = '/uploads/' + req.file.filename;
    const scheme = await Scheme.create(data);
    res.status(201).json(scheme);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create scheme' });
  }
});
router.put('/schemes/:id', auth(['admin']), upload.single('image'), async (req, res) => {
  const update = { ...req.body };
  if (req.file) update.image = '/uploads/' + req.file.filename;
  await Scheme.findByIdAndUpdate(req.params.id, update);
  res.json({ message: 'Updated' });
});
router.delete('/schemes/:id', auth(['admin']), async (req, res) => {
  await Scheme.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Contact Messages ─────────────────────────────────────────────
router.get('/contacts', auth(['admin']), async (req, res) => {
  res.json(await Contact.find().sort({ createdAt: -1 }));
});
router.put('/contacts/:id', auth(['admin']), async (req, res) => {
  await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json({ message: 'Updated' });
});
router.delete('/contacts/:id', auth(['admin']), async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Bookings ─────────────────────────────────────────────────────
router.get('/bookings', auth(['admin']), async (req, res) => {
  res.json(await Booking.find().sort({ createdAt: -1 }));
});
router.put('/bookings/:id', auth(['admin']), async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Updated' });
});

// ── Orders ───────────────────────────────────────────────────────
router.get('/orders', auth(['admin']), async (req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }));
});
router.put('/orders/:id', auth(['admin']), async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Updated' });
});

// ── Blog ─────────────────────────────────────────────────────────
router.get('/blog', auth(['admin']), async (req, res) => {
  res.json(await Blog.find().sort({ createdAt: -1 }));
});

// ── Notices ──────────────────────────────────────────────────────
router.get('/notices', auth(['admin']), async (req, res) => {
  res.json(await Notice.find().sort({ createdAt: -1 }));
});
router.post('/notices', auth(['admin']), async (req, res) => {
  const n = await Notice.create(req.body);
  res.status(201).json(n);
});
router.delete('/notices/:id', auth(['admin']), async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
