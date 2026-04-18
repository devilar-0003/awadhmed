const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const auth    = require('../middleware/auth');

const SECRET  = process.env.JWT_SECRET  || 'awadhmed_secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const sign = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role, name: user.name, phone: user.phone || '' },
  SECRET, { expiresIn: EXPIRES }
);

/* POST /api/auth/register */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const allowedRoles = ['patient', 'doctor'];
    const userRole = allowedRoles.includes(role) ? role : 'patient';

    const user = await User.create({
      name, email,
      password: await bcrypt.hash(password, 10),
      phone: phone || '', role: userRole
    });

    res.status(201).json({ token: sign(user), user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/* POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: sign(user), user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

/* POST /api/auth/otp/send */
router.post('/otp/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.replace(/\D/g,'').length < 10)
      return res.status(400).json({ error: 'Valid 10-digit mobile number required' });

    const cleanPhone = phone.replace(/\D/g,'').slice(-10);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash   = await bcrypt.hash(otp, 8);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ phone: cleanPhone });
    if (user) {
      user.otpHash = otpHash; user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      await User.create({
        name: 'User ' + cleanPhone.slice(-4),
        email: cleanPhone + '@mobile.awadhmed.in',
        password: '', phone: cleanPhone, role: 'patient',
        otpHash, otpExpiry
      });
    }
    res.json({ sent: true, demo_otp: otp }); // remove demo_otp in production
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

/* POST /api/auth/otp/verify */
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

    const cleanPhone = phone.replace(/\D/g,'').slice(-10);
    const user = await User.findOne({ phone: cleanPhone });
    if (!user) return res.status(404).json({ error: 'Phone not found. Request a new OTP.' });

    if (!user.otpHash || !user.otpExpiry || new Date() > user.otpExpiry)
      return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });

    const match = await bcrypt.compare(otp, user.otpHash);
    if (!match) return res.status(401).json({ error: 'Incorrect OTP. Try again.' });

    user.otpHash = null; user.otpExpiry = null;
    await user.save();

    res.json({ token: sign(user), user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

/* GET /api/auth/me */
router.get('/me', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/* PUT /api/auth/profile */
router.put('/profile', auth(), async (req, res) => {
  try {
    const { name, phone, address, dob, avatar } = req.body;
    const update = {};
    if (name)    update.name    = name;
    if (phone)   update.phone   = phone;
    if (address) update.address = address;
    if (dob)     update.dob     = dob;
    if (avatar)  update.avatar  = avatar;
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

/* PUT /api/auth/change-password */
router.put('/change-password', auth(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const user = await User.findById(req.user.id);
    if (user.password) {
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ error: 'Current password is incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Password change failed' });
  }
});

module.exports = router;
