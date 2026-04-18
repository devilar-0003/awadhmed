const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, default: '' },
  phone:     { type: String, default: '' },
  role:      { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  avatar:    { type: String, default: '' },
  address:   { type: String, default: '' },
  dob:       { type: String, default: '' },
  otpHash:   { type: String, default: null },
  otpExpiry: { type: Date, default: null },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otpHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
