import { Request, Response, NextFunction } from 'express';
import otpService from '../services/otp.service';
import { GenerateOTPDto } from '../dto/generate-otp.dto';
import { VerifyOTPDto } from '../dto/verify-otp.dto';
import { BadRequestError } from '../utils/app-error.util';


export class OTPController {
  /**
   * Generate OTP
   * POST /api/v1/otp/generate
   */
  async generateOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recipient, type, subject } = req.body as GenerateOTPDto;

      // Check rate limiting
      const canGenerate = await otpService.canGenerateOTP(recipient);
      if (!canGenerate) {
        throw new BadRequestError(
          'Too many active OTP requests. Please wait for existing OTPs to expire.'
        );
      }

      // Generate and send OTP
      const verificationId = await otpService.generateOTP(recipient, type, subject);

      res.status(200).json({
        message: `OTP successfully sent to ${recipient} via ${type}`,
        verificationId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify OTP
   * POST /api/v1/otp/verify
   */
  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { verificationId, otp } = req.body as VerifyOTPDto;

      // Verify OTP
      const result = await otpService.verifyOTP(verificationId, otp);

      res.status(200).json({
        message: 'OTP verification successful',
        recipient: result.recipient,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get OTP status (optional endpoint for debugging)
   * GET /api/v1/otp/status/:verificationId
   */
  async getOTPStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { verificationId } = req.params;

      if (!verificationId) {
        throw new BadRequestError('Verification ID is required');
      }

      const status = await otpService.getOTPStatus(verificationId);

      res.status(200).json({
        verificationId,
        ...status,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OTPController();
