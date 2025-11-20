// Test setup and global configuration
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Setup in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.REDIS_URI = 'redis://localhost:6379';
process.env.CLIENT_SECRET_KEY = 'test-secret-key';
process.env.LOG_LEVEL = 'error';
