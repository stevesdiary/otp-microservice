import 'reflect-metadata';
import { IsString, IsEmail, IsIn, IsNotEmpty, IsPhoneNumber, ValidateIf, IsOptional } from 'class-validator';

export class GenerateOTPDto {
  @IsNotEmpty()
  @IsString()
  recipient!: string;

  @IsNotEmpty()
  @IsIn(['email', 'sms'])
  type!: 'email' | 'sms';

  @IsOptional()
  @IsString()
  subject?: string;

  // Custom validation based on type
  @ValidateIf((o) => o.type === 'email')
  @IsEmail({}, { message: 'Invalid email address' })
  get emailValidation(): string | undefined {
    return this.type === 'email' ? this.recipient : undefined;
  }

  // Note: Phone validation is basic, can be enhanced with specific formats
  @ValidateIf((o) => o.type === 'sms')
  @IsPhoneNumber()
  get phoneValidation(): string | undefined {
    return this.type === 'sms' ? this.recipient : undefined;
  }
}
