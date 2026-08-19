const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connected.');
  } catch (error) {
    console.error('MongoDB connection failed.');
    throw error;
  }
}

module.exports = connectDB;
