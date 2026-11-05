const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizcraft';
  try {
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.error(`[Database Error] Connection URI: ${connStr.replace(/:([^@]+)@/, ':****@')}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database Error] Exiting process due to database connection failure in production.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;

