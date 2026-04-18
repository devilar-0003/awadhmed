const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:       String,
  userEmail:      String,
  items:          [{ medicineId: String, name: String, brand: String, price: Number, qty: Number, total: Number }],
  subtotal:       Number,
  deliveryCharge: Number,
  total:          Number,
  address:        String,
  status:         { type: String, enum: ['pending_payment','confirmed','shipped','delivered','cancelled'], default: 'pending_payment' },
  transactionRef: String,
  upiRef:         { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
