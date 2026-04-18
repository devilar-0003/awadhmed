const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, required: true },
  longDesc:    { type: String, default: '' },
  category:    { type: String, enum: ['Health', 'Insurance', 'Women', 'Senior', 'Other'], default: 'Health' },
  eligibility: { type: String, default: '' },
  benefits:    { type: String, default: '' },
  applyLink:   { type: String, default: '' },
  image:       { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
