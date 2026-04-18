const router = require('express').Router();
const Blog   = require('../models/Blog');
const auth   = require('../middleware/auth');

// GET /api/blog — public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { published: true };
    if (category) query.category = category;
    let posts = await Blog.find(query).sort({ createdAt: -1 });
    if (search) {
      const s = search.toLowerCase();
      posts = posts.filter(p => p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s));
    }
    res.json(posts.map(p => ({ ...p.toObject(), content: p.content.substring(0, 200) + '...' })));
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// GET /api/blog/:slug — public
router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// POST /api/blog — admin
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { title, content, excerpt, author, category, tags, published } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const post = await Blog.create({
      title, content, excerpt: excerpt || content.substring(0, 160),
      author: author || 'AwadhMed Team', category: category || 'General',
      tags: tags || [], slug, published: published !== false
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/blog/:id — admin
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const post = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// DELETE /api/blog/:id — admin
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
