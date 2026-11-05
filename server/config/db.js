const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizcraft';

  // If explicit Atlas or custom URI provided, try that first
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Could not connect to primary URI (${uri}): ${error.message}`);

    // If production, do not start in-memory server
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database Error] Exiting process due to database connection failure in production.');
      process.exit(1);
    }

    // In development / demo mode: fallback to MongoMemoryServer
    console.log('[Database] Starting embedded in-memory MongoDB instance for local dev & demo...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'quizcraft',
        },
      });
      const memoryUri = mongoMemoryServer.getUri();
      process.env.MONGODB_URI = memoryUri;

      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] In-memory MongoDB running at: ${memoryUri}`);

      // Auto-seed in-memory database so developer/evaluator has instant data
      const { seedDatabase } = require('../seed/seedLogic');
      await seedDatabase();

      return conn;
    } catch (memError) {
      console.error(`[Database Error] In-memory MongoDB failed to start: ${memError.message}`);
      throw memError;
    }
  }
};

module.exports = connectDB;
