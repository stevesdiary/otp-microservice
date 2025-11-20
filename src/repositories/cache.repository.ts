import { getRedisClient } from '../config/redis.config';
import logger from '../utils/logger.util';

export interface CacheData {
  otp: string;
  recipient: string;
  type: 'email' | 'sms';
}

export class CacheRepository {
  /**
   * Set OTP in cache with expiration
   */
  async set(key: string, data: CacheData, expirySeconds: number): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const value = JSON.stringify(data);
      
      await redisClient.set(key, value, {
        EX: expirySeconds,
      });
      
      logger.debug('Data cached successfully', { key, expirySeconds });
    } catch (error) {
      logger.error('Error setting cache:', error);
      throw error;
    }
  }

  /**
   * Get data from cache
   */
  async get(key: string): Promise<CacheData | null> {
    try {
      const redisClient = getRedisClient();
      const value = await redisClient.get(key);
      
      if (!value) {
        return null;
      }
      
      const data = JSON.parse(value) as CacheData;
      logger.debug('Data retrieved from cache', { key });
      return data;
    } catch (error) {
      logger.error('Error getting cache:', error);
      throw error;
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      const result = await redisClient.del(key);
      logger.debug('Data deleted from cache', { key, deleted: result > 0 });
      return result > 0;
    } catch (error) {
      logger.error('Error deleting cache:', error);
      throw error;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Error checking cache existence:', error);
      throw error;
    }
  }

  /**
   * Get TTL (time to live) of a key
   */
  async getTTL(key: string): Promise<number> {
    try {
      const redisClient = getRedisClient();
      const ttl = await redisClient.ttl(key);
      return ttl;
    } catch (error) {
      logger.error('Error getting TTL:', error);
      throw error;
    }
  }

  /**
   * Generate cache key for OTP
   */
  static generateOtpKey(verificationId: string): string {
    return `otp:${verificationId}`;
  }
}

export default new CacheRepository();
