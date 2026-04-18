const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  brand:       { type: String, default: '' },
  category:    { type: String, default: 'General' },
  price:       { type: Number, required: true },
  stock:       { type: Number, default: 0 },
  description: { type: String, default: '' },
  image:       { type: String, default: '💊' },
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
