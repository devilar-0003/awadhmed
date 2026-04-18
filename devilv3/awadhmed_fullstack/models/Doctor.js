const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  specialty:   { type: String, required: true },
  hospital:    { type: String, default: '' },
  fee:         { type: Number, default: 500 },
  rating:      { type: Number, default: 4.5, min: 0, max: 5 },
  experience:  { type: Number, default: 0 },
  photo:       { type: String, default: '' },
  available:   { type: Boolean, default: true },
  slots:       [{ type: String }],
  upiId:       { type: String, default: '' },
  bio:         { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
