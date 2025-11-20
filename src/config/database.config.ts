import mongoose from 'mongoose';
import { config } from './index';
import logger from '../utils/logger.util';

/**
 * Connect to MongoDB
 */
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongo.uri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
    throw error;
  }
}

/**
 * Check MongoDB connection health
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Event listeners
mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

export default { connectDatabase, disconnectDatabase, isDatabaseConnected };
