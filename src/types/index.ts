import { Document } from 'mongoose';

// OTP Types
export interface IOtp extends Document {
  verificationId: string;
  recipient: string;
  otp: string;
  type: 'email' | 'sms';
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
}

export type OtpType = 'email' | 'sms';

// Request/Response Types
export interface GenerateOTPRequest {
  recipient: string;
  type: OtpType;
}

export interface GenerateOTPResponse {
  message: string;
  verificationId: string;
}

export interface VerifyOTPRequest {
  verificationId: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  recipient: string;
}

// Service Types
export interface OTPRecord {
  otp: string;
  recipient: string;
  type: OtpType;
}

// Configuration Types
export interface AppConfig {
  port: number;
  mongoUri: string;
  redisUri: string;
  clientSecretKey: string;
  otpLength: number;
  otpExpirySeconds: number;
  otpExpiryMinutes: number;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  senderEmail: string;
}

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}
