import { config } from '../config';
import otpRepository from '../repositories/otp.repository';
import cacheRepository, { CacheRepository } from '../repositories/cache.repository';
import emailService from './email.service';
import smsService from './sms.service';
import { generateOTP, generateVerificationId } from '../utils/otp-generator.util';
import logger from '../utils/logger.util';
import { BadRequestError, UnauthorizedError, InternalServerError } from '../utils/app-error.util';

export class OTPService {
  /**
   * Generate and send OTP
   */
  async generateOTP(recipient: string, type: 'email' | 'sms', subject?: string): Promise<string> {
    try {
      // Generate OTP and verification ID
      const otp = generateOTP(config.otp.length);
      const verificationId = generateVerificationId();

      // Send OTP based on type
      let success = false;
      if (type === 'email') {
        success = await emailService.sendOTP(recipient, otp, subject);
      } else if (type === 'sms') {
        success = await smsService.sendOTP(recipient, otp);
      }

      if (!success) {
        throw new InternalServerError(`Failed to send OTP via ${type}`);
      }

      // Cache OTP in Redis
      const cacheKey = CacheRepository.generateOtpKey(verificationId);
      await cacheRepository.set(
        cacheKey,
        { otp, recipient, type },
        config.otp.expirySeconds
      );

      // Store OTP in MongoDB for logging
      const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);
      await otpRepository.create({
        verificationId,
        recipient,
        otp,
        type,
        expiresAt,
      });

      logger.info('OTP generated and sent successfully', {
        verificationId,
        recipient,
        type,
      });

      return verificationId;
    } catch (error) {
      logger.error('Error generating OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(verificationId: string, otp: string): Promise<{ 
    verified: boolean; 
    recipient: string 
  }> {
    try {
      // Check cache first (fast path)
      const cacheKey = CacheRepository.generateOtpKey(verificationId);
      const cachedData = await cacheRepository.get(cacheKey);

      if (!cachedData) {
        throw new UnauthorizedError('Invalid or expired verification ID');
      }

      // Verify OTP
      if (cachedData.otp !== otp) {
        logger.warn('Incorrect OTP provided', { verificationId });
        throw new UnauthorizedError('Incorrect OTP');
      }

      // Delete from cache to prevent replay attacks
      await cacheRepository.delete(cacheKey);

      // Update MongoDB record
      await otpRepository.markAsVerified(verificationId);

      logger.info('OTP verified successfully', {
        verificationId,
        recipient: cachedData.recipient,
      });

      return {
        verified: true,
        recipient: cachedData.recipient,
      };
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Get OTP status
   */
  async getOTPStatus(verificationId: string): Promise<{
    exists: boolean;
    expiresIn?: number;
    verified?: boolean;
  }> {
    try {
      const cacheKey = CacheRepository.generateOtpKey(verificationId);
      const exists = await cacheRepository.exists(cacheKey);

      if (!exists) {
        return { exists: false };
      }

      const ttl = await cacheRepository.getTTL(cacheKey);
      
      // Check database for verification status
      const dbRecord = await otpRepository.findByVerificationId(verificationId);

      return {
        exists: true,
        expiresIn: ttl,
        verified: dbRecord?.verified || false,
      };
    } catch (error) {
      logger.error('Error getting OTP status:', error);
      throw error;
    }
  }

  /**
   * Check rate limiting for recipient
   */
  async canGenerateOTP(recipient: string, maxActiveOtps: number = 3): Promise<boolean> {
    try {
      const activeCount = await otpRepository.countActiveOtps(recipient);
      return activeCount < maxActiveOtps;
    } catch (error) {
      logger.error('Error checking rate limit:', error);
      return false;
    }
  }
}

export default new OTPService();
