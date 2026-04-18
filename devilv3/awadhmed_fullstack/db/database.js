const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/awadhmed';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => console.log('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

module.exports = connectDB;
