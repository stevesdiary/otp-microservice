import { Router } from 'express';
import otpController from '../controllers/otp.controller';
import { authenticateClient } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { GenerateOTPDto } from '../dto/generate-otp.dto';
import { VerifyOTPDto } from '../dto/verify-otp.dto';

const router = Router();

/**
 * @route   POST /api/v1/otp/generate
 * @desc    Generate and send OTP
 * @access  Protected (requires client secret)
 */
router.post(
  '/generate',
  authenticateClient,
  validateDto(GenerateOTPDto),
  otpController.generateOTP.bind(otpController)
);

/**
 * @route   POST /api/v1/otp/verify
 * @desc    Verify OTP
 * @access  Protected (requires client secret)
 */
router.post(
  '/verify',
  authenticateClient,
  validateDto(VerifyOTPDto),
  otpController.verifyOTP.bind(otpController)
);

/**
 * @route   GET /api/v1/otp/status/:verificationId
 * @desc    Get OTP status (for debugging)
 * @access  Protected (requires client secret)
 */
router.get(
  '/status/:verificationId',
  authenticateClient,
  otpController.getOTPStatus.bind(otpController)
);

export default router;
