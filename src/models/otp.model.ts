import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  verificationId: string;
  recipient: string;
  otp: string;
  type: 'email' | 'sms';
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
}

const OtpSchema: Schema = new Schema(
  {
    verificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete expired documents
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for faster queries
OtpSchema.index({ verificationId: 1, verified: 1 });

const OtpModel = mongoose.model<IOtp>('OtpRecord', OtpSchema);

export default OtpModel;
