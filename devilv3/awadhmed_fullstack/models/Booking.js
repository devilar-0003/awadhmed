const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  patientId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName:     String,
  patientEmail:    String,
  doctorId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName:      String,
  doctorSpecialty: String,
  hospital:        String,
  date:            { type: String, required: true },
  slot:            { type: String, required: true },
  symptoms:        { type: String, default: '' },
  amount:          { type: Number, default: 0 },
  status:          { type: String, enum: ['pending_payment','confirmed','completed','cancelled'], default: 'pending_payment' },
  transactionRef:  String,
  upiRef:          { type: String, default: null },
  confirmedAt:     { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
