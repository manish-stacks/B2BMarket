import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword } from '@/lib/bcrypt';
import { signToken } from '@/lib/jwt';
import { loginSchema } from '@/lib/validations';
import { apiResponse, apiError } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 422);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
      include: { vendor: true },
    });

    if (!user) return apiError('Invalid email or password', 401);
    if (user.status === 'SUSPENDED') return apiError('Your account has been suspended', 403);
    if (user.status === 'INACTIVE') return apiError('Your account is inactive', 403);

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return apiError('Invalid email or password', 401);

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return apiResponse({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, phone: user.phone, avatar: user.avatar,
        vendor: user.vendor ? { id: user.vendor.id, companyName: user.vendor.companyName, status: user.vendor.status } : null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return apiError('Login failed', 500);
  }
}
