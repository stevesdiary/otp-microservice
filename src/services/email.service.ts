import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';
import logger from '../utils/logger.util';

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: false, // Use TLS
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
      },
    });
  }

  /**
   * Send OTP via email
   */
  async sendOTP(email: string, otp: string, subject?: string): Promise<boolean> {
    const mailOptions = {
      from: config.email.senderEmail,
      to: email,
      subject: subject || `Your One-Time Password (OTP) is ${otp}`,
      html: this.generateEmailTemplate(otp),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { 
        email, 
        messageId: info.messageId 
      });
      return true;
    } catch (error) {
      logger.error('Error sending email:', { email, error });
      return false;
    }
  }

  /**
   * Generate HTML email template
   */
  private generateEmailTemplate(otp: string): string {
    const expiryMinutes = config.otp.expirySeconds / 60;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your OTP Code</title>
          <style>
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              text-align: center;
              color: #ffffff;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .otp-box {
              background-color: #f8f9fa;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 20px;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              margin: 10px 0;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #6c757d;
            }
            .warning {
              color: #dc3545;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">OTP Verification</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Use the following code to complete your verification:
              </p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p style="font-size: 14px; color: #6c757d;">
                This code is valid for <strong>${expiryMinutes} minutes</strong>.
              </p>
              <p class="warning">
                ⚠️ Never share this code with anyone. Our team will never ask for your OTP.
              </p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} OTP Service. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();
