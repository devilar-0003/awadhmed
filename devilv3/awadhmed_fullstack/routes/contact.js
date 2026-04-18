const router  = require('express').Router();
const Contact = require('../models/Contact');
const auth    = require('../middleware/auth');

// POST /api/contact — public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address' });
    if (!message || message.trim().length < 10)
      return res.status(400).json({ error: 'Message must be at least 10 characters' });

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      subject: (subject || 'General Enquiry').trim(),
      message: message.trim()
    });
    res.status(201).json({ message: 'Your message has been received! We will contact you shortly.', id: contact._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save your message. Please try again.' });
  }
});

// GET /api/contact — admin only
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// PUT /api/contact/:id/status — admin only
router.put('/:id/status', auth(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'replied'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    await Contact.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// DELETE /api/contact/:id — admin only
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
