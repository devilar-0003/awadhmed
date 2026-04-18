const router  = require('express').Router();
const Booking = require('../models/Booking');
const Doctor  = require('../models/Doctor');
const User    = require('../models/User');
const auth    = require('../middleware/auth');

// POST /api/bookings/initiate
router.post('/initiate', auth(['patient']), async (req, res) => {
  try {
    const { doctorId, date, slot, symptoms } = req.body;
    if (!doctorId || !date || !slot)
      return res.status(400).json({ error: 'Doctor, date and slot are required' });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    if (!doctor.available) return res.status(400).json({ error: 'Doctor not available' });

    const conflict = await Booking.findOne({ doctorId, date, slot, status: { $ne: 'cancelled' } });
    if (conflict) return res.status(409).json({ error: 'This slot is already booked. Please choose another.' });

    const transactionRef = `AM${Date.now().toString(36).toUpperCase()}`;
    const booking = await Booking.create({
      patientId: req.user.id, patientName: req.user.name, patientEmail: req.user.email,
      doctorId, doctorName: doctor.name, doctorSpecialty: doctor.specialty,
      hospital: doctor.hospital, date, slot, symptoms: symptoms || '',
      amount: doctor.fee, status: 'pending_payment', transactionRef
    });

    const upiString = `upi://pay?pa=${encodeURIComponent(process.env.UPI_ID||'awadhmed@upi')}&pn=${encodeURIComponent(process.env.UPI_NAME||'AwadhMed')}&am=${doctor.fee}&cu=INR&tn=${encodeURIComponent('BookingFee-'+transactionRef)}&tr=${transactionRef}`;
    res.status(201).json({
      booking,
      payment: { upiId: process.env.UPI_ID||'awadhmed@upi', upiName: process.env.UPI_NAME||'AwadhMed Healthcare', amount: doctor.fee, transactionRef, upiString }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to initiate booking' });
  }
});

// POST /api/bookings/:id/confirm
router.post('/:id/confirm', auth(['patient']), async (req, res) => {
  try {
    const { upiRef } = req.body;
    if (!upiRef || upiRef.trim().length < 3)
      return res.status(400).json({ error: 'UPI transaction reference is required' });

    const booking = await Booking.findOne({ _id: req.params.id, patientId: req.user.id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending_payment')
      return res.status(400).json({ error: 'Booking already processed' });

    booking.status = 'confirmed'; booking.upiRef = upiRef.trim(); booking.confirmedAt = new Date();
    await booking.save();
    res.json({ booking, message: 'Booking confirmed!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// GET /api/bookings/my
router.get('/my', auth(['patient']), async (req, res) => {
  try {
    const bookings = await Booking.find({ patientId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/doctor/mine
router.get('/doctor/mine', auth(['doctor']), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ email: req.user.email });
    if (!doctor) return res.json([]);
    const bookings = await Booking.find({ doctorId: doctor._id, status: { $ne: 'pending_payment' } }).sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// PUT /api/bookings/:id/status
router.put('/:id/status', auth(['doctor', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed','completed','cancelled'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', auth(['patient']), async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, patientId: req.user.id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (!['pending_payment','confirmed'].includes(booking.status))
      return res.status(400).json({ error: 'Cannot cancel a completed booking' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel' });
  }
});

module.exports = router;
