import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define validation schema for environment variables
const envSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  
  // Server
  PORT: Joi.number().default(3000),
  
  // MongoDB
  MONGO_URI: Joi.string().required().description('MongoDB connection URI'),
  
  // Redis
  REDIS_URI: Joi.string().required().description('Redis connection URI'),
  
  // Security
  CLIENT_SECRET_KEY: Joi.string().required().description('Client authentication secret'),
  
  // Email
  BREVO_SMTP_HOST: Joi.string().required(),
  BREVO_SMTP_PORT: Joi.number().default(587),
  BREVO_SMTP_USER: Joi.string().required(),
  BREVO_SMTP_PASS: Joi.string().required(),
  SENDER_EMAIL: Joi.string().email().required(),
  
  // SMS
  TWILIO_ACCOUNT_SID: Joi.string().required(),
  TWILIO_AUTH_TOKEN: Joi.string().required(),
  TWILIO_PHONE_NUMBER: Joi.string().required(),
  
  // OTP
  OTP_LENGTH: Joi.number().min(4).max(10).default(6),
  OTP_EXPIRY_SECONDS: Joi.number().default(300),
  OTP_EXPIRY_MINUTES: Joi.number().default(60),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  
  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export configuration object
export const config = {
  env: envVars.NODE_ENV as string,
  port: envVars.PORT as number,
  
  // MongoDB
  mongo: {
    uri: envVars.MONGO_URI as string,
  },
  
  // Redis
  redis: {
    uri: envVars.REDIS_URI as string,
  },
  
  // Security
  security: {
    clientSecretKey: envVars.CLIENT_SECRET_KEY as string,
  },
  
  // Email
  email: {
    smtpHost: envVars.BREVO_SMTP_HOST as string,
    smtpPort: envVars.BREVO_SMTP_PORT as number,
    smtpUser: envVars.BREVO_SMTP_USER as string,
    smtpPass: envVars.BREVO_SMTP_PASS as string,
    senderEmail: envVars.SENDER_EMAIL as string,
  },
  
  // SMS
  sms: {
    accountSid: envVars.TWILIO_ACCOUNT_SID as string,
    authToken: envVars.TWILIO_AUTH_TOKEN as string,
    phoneNumber: envVars.TWILIO_PHONE_NUMBER as string,
  },
  
  // OTP
  otp: {
    length: envVars.OTP_LENGTH as number,
    expirySeconds: envVars.OTP_EXPIRY_SECONDS as number,
    expiryMinutes: envVars.OTP_EXPIRY_MINUTES as number,
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS as number,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS as number,
  },
  
  // Logging
  logging: {
    level: envVars.LOG_LEVEL as string,
  },
};

export default config;
