import OtpModel, { IOtp } from '../models/otp.model';
import logger from '../utils/logger.util';

export class OtpRepository {
  /**
   * Create a new OTP record
   */
  async create(data: {
    verificationId: string;
    recipient: string;
    otp: string;
    type: 'email' | 'sms';
    expiresAt: Date;
  }): Promise<IOtp> {
    try {
      const otpRecord = await OtpModel.create(data);
      logger.debug('OTP record created in database', { verificationId: data.verificationId });
      return otpRecord;
    } catch (error) {
      logger.error('Error creating OTP record:', error);
      throw error;
    }
  }

  /**
   * Find OTP by verification ID
   */
  async findByVerificationId(verificationId: string): Promise<IOtp | null> {
    try {
      const otpRecord = await OtpModel.findOne({ verificationId });
      return otpRecord;
    } catch (error) {
      logger.error('Error finding OTP record:', error);
      throw error;
    }
  }

  /**
   * Update OTP verification status
   */
  async markAsVerified(verificationId: string): Promise<IOtp | null> {
    try {
      const otpRecord = await OtpModel.findOneAndUpdate(
        { verificationId, verified: false },
        { $set: { verified: true } },
        { new: true }
      );
      
      if (otpRecord) {
        logger.debug('OTP marked as verified', { verificationId });
      }
      
      return otpRecord;
    } catch (error) {
      logger.error('Error updating OTP record:', error);
      throw error;
    }
  }

  /**
   * Delete OTP by verification ID
   */
  async deleteByVerificationId(verificationId: string): Promise<boolean> {
    try {
      const result = await OtpModel.deleteOne({ verificationId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Error deleting OTP record:', error);
      throw error;
    }
  }

  /**
   * Count active OTPs for a recipient
   */
  async countActiveOtps(recipient: string): Promise<number> {
    try {
      const count = await OtpModel.countDocuments({
        recipient,
        verified: false,
        expiresAt: { $gte: new Date() },
      });
      return count;
    } catch (error) {
      logger.error('Error counting active OTPs:', error);
      throw error;
    }
  }
}

export default new OtpRepository();
