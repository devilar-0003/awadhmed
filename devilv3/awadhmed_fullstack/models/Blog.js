const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  slug:      { type: String, unique: true },
  content:   { type: String, required: true },
  excerpt:   { type: String, default: '' },
  author:    { type: String, default: 'AwadhMed Team' },
  category:  { type: String, default: 'General' },
  tags:      [{ type: String }],
  published: { type: Boolean, default: true },
  image:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
