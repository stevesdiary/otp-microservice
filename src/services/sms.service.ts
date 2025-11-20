import twilio from 'twilio';
import { config } from '../config';
import logger from '../utils/logger.util';

export class SMSService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(config.sms.accountSid, config.sms.authToken);
  }

  /**
   * Send OTP via SMS
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const expiryMinutes = config.otp.expirySeconds / 60;
    const message = this.generateSMSMessage(otp, expiryMinutes);

    try {
      const result = await this.client.messages.create({
        body: message,
        to: phoneNumber,
        from: config.sms.phoneNumber,
      });

      logger.info('SMS sent successfully', {
        phoneNumber,
        messageSid: result.sid,
        status: result.status,
      });
      
      return true;
    } catch (error) {
      logger.error('Error sending SMS:', { phoneNumber, error });
      return false;
    }
  }

  /**
   * Generate SMS message
   */
  private generateSMSMessage(otp: string, expiryMinutes: number): string {
    return `Your OTP verification code is: ${otp}

This code expires in ${expiryMinutes} minutes.

Never share this code with anyone. OTP Service will never ask for your code.`;
  }

  /**
   * Verify Twilio credentials
   */
  async verifyConnection(): Promise<boolean> {
    try {
      // Fetch account details to verify credentials
      await this.client.api.accounts(config.sms.accountSid).fetch();
      logger.info('SMS service connection verified');
      return true;
    } catch (error) {
      logger.error('SMS service connection failed:', error);
      return false;
    }
  }
}

export default new SMSService();
