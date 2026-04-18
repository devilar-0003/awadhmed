const router = require('express').Router();
const Doctor = require('../models/Doctor');
const auth   = require('../middleware/auth');

// GET /api/doctors — public
router.get('/', async (req, res) => {
  try {
    const { specialty, search } = req.query;
    const query = { available: true };
    if (specialty && specialty !== 'All') query.specialty = specialty;
    let doctors = await Doctor.find(query).sort({ rating: -1 });
    if (search) {
      const s = search.toLowerCase();
      doctors = doctors.filter(d =>
        d.name.toLowerCase().includes(s) ||
        d.specialty.toLowerCase().includes(s) ||
        d.hospital.toLowerCase().includes(s)
      );
    }
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/doctors/my/profile — doctor self
router.get('/my/profile', auth(['doctor']), async (req, res) => {
  try {
    const doc = await Doctor.findOne({ email: req.user.email });
    res.json(doc || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// PUT /api/doctors/my/slots — doctor self
router.put('/my/slots', auth(['doctor']), async (req, res) => {
  try {
    const { slots, available } = req.body;
    const upd = {};
    if (slots !== undefined)     upd.slots     = slots;
    if (available !== undefined) upd.available = available;
    await Doctor.findOneAndUpdate({ email: req.user.email }, upd);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// GET /api/doctors/:id — public
router.get('/:id', async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

module.exports = router;
