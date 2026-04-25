// app/api/auth/otp/send/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateOtp } from '@/lib/auth';
import { successResponse, errorResponse, handleZodError } from '@/lib/api-helpers';
import { sendEmail, getOtpEmailHtml } from '@/lib/email';

const schema = z.object({
  email: z.string().email(),
  type: z.enum(['login', 'verify', 'reset']).default('login'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email, deletedAt: null } });
    if (!user) return errorResponse('User not found', 404);

    // Invalidate old OTPs
    await prisma.otpCode.updateMany({
      where: { email: data.email, type: data.type, usedAt: null },
      data: { usedAt: new Date() },
    });

    const code = generateOtp();
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        email: data.email,
        code,
        type: data.type,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendEmail({
      to: data.email,
      subject: 'Your OTP Code - IndiaB2B',
      html: getOtpEmailHtml(code),
    });

    // In dev, return OTP for testing
    const devOtp = process.env.NODE_ENV === 'development' ? code : undefined;

    return successResponse({ message: 'OTP sent', ...(devOtp && { otp: devOtp }) }, 'OTP sent successfully');
  } catch (error: any) {
    if (error.name === 'ZodError') return handleZodError(error);
    return errorResponse('Failed to send OTP', 500);
  }
}
