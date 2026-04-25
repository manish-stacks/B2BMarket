import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/bcrypt';
import { signToken } from '@/lib/jwt';
import { registerSchema } from '@/lib/validations';
import { apiResponse, apiError } from '@/lib/middleware';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 422);
    }

    const { name, email, phone, password, role } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existing) {
      return apiError(existing.email === email ? 'Email already registered' : 'Phone already registered', 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role },
    });

    if (role === 'VENDOR') {
      await prisma.vendor.create({
        data: { userId: user.id, companyName: `${name}'s Company` },
      });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    // Send welcome email (fire and forget)
    sendEmail({ to: email, subject: 'Welcome to B2B Marketplace', html: emailTemplates.welcome(name) }).catch(console.error);

    await prisma.notification.create({
      data: { userId: user.id, title: 'Welcome!', message: 'Your account has been created successfully.', type: 'success' },
    });

    return apiResponse({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    }, 201);
  } catch (err: any) {
    console.error('Register error:', err);
    return apiError('Registration failed', 500);
  }
}
