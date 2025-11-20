import crypto from 'crypto';

/**
 * Generates a cryptographically secure random numeric OTP
 * @param length - Length of the OTP (default: 6)
 * @returns A string representing the OTP
 */
export function generateOTP(length: number = 6): string {
  if (length < 4 || length > 10) {
    throw new Error('OTP length must be between 4 and 10');
  }

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Generates a unique verification ID
 * @returns A UUID string
 */
export function generateVerificationId(): string {
  return crypto.randomUUID();
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format (international)
 * @param phoneNumber - Phone number to validate
 * @returns True if valid, false otherwise
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation for international format (E.164)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Sanitizes recipient input
 * @param recipient - Recipient to sanitize
 * @returns Sanitized recipient string
 */
export function sanitizeRecipient(recipient: string): string {
  return recipient.trim().toLowerCase();
}
