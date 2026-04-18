const router = require('express').Router();
const Scheme = require('../models/Scheme');
const auth   = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/schemes — public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    let schemes = await Scheme.find(query).sort({ createdAt: -1 });
    if (search) {
      const q = search.toLowerCase();
      schemes = schemes.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

// GET /api/schemes/:id — public
router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    res.json(scheme);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scheme' });
  }
});

// POST /api/schemes — admin only
router.post('/', auth(['admin']), upload.single('image'), async (req, res) => {
  try {
    const { name, description, longDesc, category, eligibility, benefits, applyLink } = req.body;
    if (!name || !description) return res.status(400).json({ error: 'Name and description are required' });
    const data = { name, description, longDesc, category, eligibility, benefits, applyLink };
    if (req.file) data.image = '/uploads/' + req.file.filename;
    const scheme = await Scheme.create(data);
    res.status(201).json(scheme);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create scheme' });
  }
});

// PUT /api/schemes/:id — admin only
router.put('/:id', auth(['admin']), upload.single('image'), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.image = '/uploads/' + req.file.filename;
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    res.json(scheme);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update scheme' });
  }
});

// DELETE /api/schemes/:id — admin only
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scheme deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete scheme' });
  }
});

module.exports = router;
