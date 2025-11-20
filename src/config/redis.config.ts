import { createClient, RedisClientType } from 'redis';
import { config } from './index';
import logger from '../utils/logger.util';

let redisClient: RedisClientType | null = null;

/**
 * Connect to Redis
 */
export async function connectRedis(): Promise<RedisClientType> {
  try {
    redisClient = createClient({ url: config.redis.uri });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    redisClient.on('ready', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis client reconnecting...');
    });

    redisClient.on('end', () => {
      logger.warn('Redis connection closed');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

/**
 * Disconnect from Redis
 */
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis disconnected successfully');
    }
  } catch (error) {
    logger.error('Redis disconnection error:', error);
    throw error;
  }
}

/**
 * Check Redis connection health
 */
export async function isRedisConnected(): Promise<boolean> {
  try {
    if (!redisClient) return false;
    await redisClient.ping();
    return true;
  } catch (error) {
    return false;
  }
}

export default { connectRedis, getRedisClient, disconnectRedis, isRedisConnected };
