import { OTPService } from '../../../src/services/otp.service';
import otpRepository from '../../../src/repositories/otp.repository';
import cacheRepository from '../../../src/repositories/cache.repository';
import emailService from '../../../src/services/email.service';
import smsService from '../../../src/services/sms.service';

// Mock dependencies
jest.mock('../../../src/repositories/otp.repository');
jest.mock('../../../src/repositories/cache.repository');
jest.mock('../../../src/services/email.service');
jest.mock('../../../src/services/sms.service');
jest.mock('../../../src/utils/otp-generator.util', () => ({
  generateOTP: jest.fn(() => '123456'),
  generateVerificationId: jest.fn(() => 'test-verification-id'),
}));

describe('OTPService', () => {
  let otpService: OTPService;

  beforeEach(() => {
    otpService = new OTPService();
    jest.clearAllMocks();
  });

  describe('generateOTP', () => {
    it('should generate OTP and send via email', async () => {
      // Arrange
      const recipient = 'test@example.com';
      const type = 'email';

      (emailService.sendOTP as jest.Mock).mockResolvedValue(true);
      (cacheRepository.set as jest.Mock).mockResolvedValue(undefined);
      (otpRepository.create as jest.Mock).mockResolvedValue({
        verificationId: 'test-verification-id',
        recipient,
        otp: '123456',
        type,
      });

      // Act
      const result = await otpService.generateOTP(recipient, type);

      // Assert
      expect(result).toBe('test-verification-id');
      expect(emailService.sendOTP).toHaveBeenCalledWith(recipient, '123456');
      expect(cacheRepository.set).toHaveBeenCalled();
      expect(otpRepository.create).toHaveBeenCalled();
    });

    it('should generate OTP and send via SMS', async () => {
      // Arrange
      const recipient = '+1234567890';
      const type = 'sms';

      (smsService.sendOTP as jest.Mock).mockResolvedValue(true);
      (cacheRepository.set as jest.Mock).mockResolvedValue(undefined);
      (otpRepository.create as jest.Mock).mockResolvedValue({
        verificationId: 'test-verification-id',
        recipient,
        otp: '123456',
        type,
      });

      // Act
      const result = await otpService.generateOTP(recipient, type);

      // Assert
      expect(result).toBe('test-verification-id');
      expect(smsService.sendOTP).toHaveBeenCalledWith(recipient, '123456');
    });

    it('should throw error when OTP sending fails', async () => {
      // Arrange
      const recipient = 'test@example.com';
      const type = 'email';

      (emailService.sendOTP as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(otpService.generateOTP(recipient, type)).rejects.toThrow();
    });
  });

  describe('verifyOTP', () => {
    it('should verify correct OTP', async () => {
      // Arrange
      const verificationId = 'test-verification-id';
      const otp = '123456';

      (cacheRepository.get as jest.Mock).mockResolvedValue({
        otp: '123456',
        recipient: 'test@example.com',
        type: 'email',
      });
      (cacheRepository.delete as jest.Mock).mockResolvedValue(true);
      (otpRepository.markAsVerified as jest.Mock).mockResolvedValue({});

      // Act
      const result = await otpService.verifyOTP(verificationId, otp);

      // Assert
      expect(result.verified).toBe(true);
      expect(result.recipient).toBe('test@example.com');
      expect(cacheRepository.delete).toHaveBeenCalled();
      expect(otpRepository.markAsVerified).toHaveBeenCalled();
    });

    it('should throw error for invalid verification ID', async () => {
      // Arrange
      const verificationId = 'invalid-id';
      const otp = '123456';

      (cacheRepository.get as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(otpService.verifyOTP(verificationId, otp)).rejects.toThrow(
        'Invalid or expired verification ID'
      );
    });

    it('should throw error for incorrect OTP', async () => {
      // Arrange
      const verificationId = 'test-verification-id';
      const otp = '999999';

      (cacheRepository.get as jest.Mock).mockResolvedValue({
        otp: '123456',
        recipient: 'test@example.com',
        type: 'email',
      });

      // Act & Assert
      await expect(otpService.verifyOTP(verificationId, otp)).rejects.toThrow('Incorrect OTP');
    });
  });

  describe('canGenerateOTP', () => {
    it('should return true when under rate limit', async () => {
      // Arrange
      const recipient = 'test@example.com';
      (otpRepository.countActiveOtps as jest.Mock).mockResolvedValue(2);

      // Act
      const result = await otpService.canGenerateOTP(recipient);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when at rate limit', async () => {
      // Arrange
      const recipient = 'test@example.com';
      (otpRepository.countActiveOtps as jest.Mock).mockResolvedValue(3);

      // Act
      const result = await otpService.canGenerateOTP(recipient);

      // Assert
      expect(result).toBe(false);
    });
  });
});
