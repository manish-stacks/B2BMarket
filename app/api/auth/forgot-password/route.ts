import { NextRequest } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/middleware';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return apiError('Email is required', 400);

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent user enumeration
    if (!user) return apiResponse({ message: 'If this email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpiry: expiry } });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
    await sendEmail({ to: email, subject: 'Reset your password', html: emailTemplates.passwordReset(resetUrl) });

    return apiResponse({ message: 'If this email exists, a reset link has been sent.' });
  } catch {
    return apiError('Failed to process request', 500);
  }
}
