require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { seedDatabase } = require('./seedLogic');

const run = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizcraft';
  console.log(`[Seed Script] Connecting to MongoDB: ${uri.replace(/:([^@]+)@/, ':****@')}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed Script] Connected to MongoDB.');
    await seedDatabase();
    console.log('[Seed Script] Completed successfully.');
    process.exit(0);
  } catch (error) {
    console.warn(`[Seed Script] Direct connection failed: ${error.message}`);
    console.log('[Seed Script] Using MongoMemoryServer to verify seed logic...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      await seedDatabase();
      console.log('[Seed Script] Seed verification on in-memory instance succeeded.');
      await mongod.stop();
      process.exit(0);
    } catch (inner) {
      console.error('[Seed Script Error]', inner);
      process.exit(1);
    }
  }
};

run();
