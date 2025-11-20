import request from 'supertest';
import app from '../../src/index';
import emailService from '../../src/services/email.service';

// Mock email service
jest.mock('../../src/services/email.service', () => ({
  sendOTP: jest.fn().mockResolvedValue(true),
  verifyConnection: jest.fn().mockResolvedValue(true),
}));

describe('Custom Email Subject Integration', () => {
  it('should use the custom subject when provided', async () => {
    const customSubject = 'OTP for your signup to confirm email to our CRM platform';
    const recipient = 'test@example.com';

    const response = await request(app)
      .post('/api/v1/otp/generate')
      .send({
        recipient,
        type: 'email',
        subject: customSubject,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('verificationId');
    expect(response.body.message).toContain(`OTP successfully sent to ${recipient}`);

    // Verify email service was called with the custom subject
    expect(emailService.sendOTP).toHaveBeenCalledWith(
      recipient,
      expect.any(String),
      customSubject
    );
  });

  it('should use the default subject when no subject is provided', async () => {
    const recipient = 'default@example.com';

    const response = await request(app)
      .post('/api/v1/otp/generate')
      .send({
        recipient,
        type: 'email',
      });

    expect(response.status).toBe(200);
    
    // Verify email service was called with undefined subject (handled in service)
    expect(emailService.sendOTP).toHaveBeenCalledWith(
      recipient,
      expect.any(String),
      undefined
    );
  });
});
