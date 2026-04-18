const router   = require('express').Router();
const Order    = require('../models/Order');
const Medicine = require('../models/Medicine');
const auth     = require('../middleware/auth');

// GET /api/orders/medicines — public
router.get('/medicines', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category && category !== 'All') query.category = category;
    let meds = await Medicine.find(query).sort({ name: 1 });
    if (search) {
      const s = search.toLowerCase();
      meds = meds.filter(m => m.name.toLowerCase().includes(s) || m.brand.toLowerCase().includes(s));
    }
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// POST /api/orders/initiate
router.post('/initiate', auth(['patient']), async (req, res) => {
  try {
    const { items, address } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });
    if (!address) return res.status(400).json({ error: 'Delivery address is required' });

    let total = 0;
    const enriched = [];
    for (const item of items) {
      const med = await Medicine.findById(item.medicineId);
      if (!med) return res.status(400).json({ error: `Medicine not found` });
      if (med.stock < item.qty) return res.status(400).json({ error: `Insufficient stock for ${med.name}` });
      const lineTotal = med.price * item.qty;
      total += lineTotal;
      enriched.push({ medicineId: med._id, name: med.name, brand: med.brand, price: med.price, qty: item.qty, total: lineTotal });
    }

    const deliveryCharge = total >= 500 ? 0 : 40;
    const transactionRef = `AMOR${Date.now().toString(36).toUpperCase()}`;
    const order = await Order.create({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email,
      items: enriched, subtotal: total, deliveryCharge, total: total + deliveryCharge,
      address, status: 'pending_payment', transactionRef
    });

    const upiString = `upi://pay?pa=${encodeURIComponent(process.env.UPI_ID||'awadhmed@upi')}&pn=${encodeURIComponent(process.env.UPI_NAME||'AwadhMed')}&am=${total+deliveryCharge}&cu=INR&tn=${encodeURIComponent('MedOrder-'+transactionRef)}&tr=${transactionRef}`;
    res.status(201).json({
      order,
      payment: { upiId: process.env.UPI_ID||'awadhmed@upi', upiName: process.env.UPI_NAME||'AwadhMed Healthcare', amount: total+deliveryCharge, transactionRef, upiString }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// POST /api/orders/:id/confirm
router.post('/:id/confirm', auth(['patient']), async (req, res) => {
  try {
    const { upiRef } = req.body;
    if (!upiRef || upiRef.trim().length < 3)
      return res.status(400).json({ error: 'UPI transaction reference required' });

    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending_payment')
      return res.status(400).json({ error: 'Order already processed' });

    // Deduct stock
    for (const item of order.items) {
      await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { stock: -item.qty } });
    }
    order.status = 'confirmed'; order.upiRef = upiRef.trim();
    await order.save();
    res.json({ order, message: 'Order confirmed!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm order' });
  }
});

// GET /api/orders/my
router.get('/my', auth(['patient']), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', auth(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
