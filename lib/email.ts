import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  await transporter.sendMail({
    from: `"B2B Marketplace" <${process.env.EMAIL_FROM}>`,
    ...options,
  });
}

export const emailTemplates = {
  welcome: (name: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #ea580c; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">B2B Marketplace</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Welcome, ${name}!</h2>
        <p>Thank you for joining B2B Marketplace. Start exploring thousands of verified suppliers and products.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Explore Now</a>
      </div>
    </div>
  `,
  otp: (otp: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #ea580c; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">B2B Marketplace</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
        <h2>Your OTP Code</h2>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ea580c;">${otp}</span>
        </div>
        <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      </div>
    </div>
  `,
  inquiryReceived: (vendorName: string, productTitle: string, buyerName: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #ea580c; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Inquiry Received</h1>
      </div>
      <div style="padding: 30px;">
        <p>Hi ${vendorName},</p>
        <p><strong>${buyerName}</strong> has sent an inquiry for <strong>${productTitle}</strong>.</p>
        <p>Log in to your dashboard to respond.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/vendor/inquiries" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Inquiry</a>
      </div>
    </div>
  `,
  passwordReset: (resetUrl: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #ea580c; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Reset Your Password</h1>
      </div>
      <div style="padding: 30px;">
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `,
};
