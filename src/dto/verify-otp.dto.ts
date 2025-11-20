import 'reflect-metadata';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class VerifyOTPDto {
  @IsNotEmpty()
  @IsString()
  verificationId!: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 10)
  @Matches(/^[0-9]+$/, { message: 'OTP must contain only numbers' })
  otp!: string;
}
