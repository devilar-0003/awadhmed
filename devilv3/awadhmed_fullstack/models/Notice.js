const mongoose = require('mongoose');
const noticeSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  content: { type: String, required: true },
  type:    { type: String, enum: ['info','warning','success'], default: 'info' },
}, { timestamps: true });
module.exports = mongoose.model('Notice', noticeSchema);
