import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        vendor: true,
        _count: { select: { buyerInquiries: true, wishlist: true } },
      },
    });
    if (!user) return apiError('User not found', 404);
    const { password, otp, resetToken, ...safeUser } = user;
    return apiResponse(safeUser);
  } catch {
    return apiError('Failed to fetch user', 500);
  }
});

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const allowed = ['name', 'avatar', 'phone'];
    const data: any = {};
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
    });
    return apiResponse(user);
  } catch {
    return apiError('Failed to update profile', 500);
  }
});
