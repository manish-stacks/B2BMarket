import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, images: true, slug: true } },
          },
        },
      },
    });
    return apiResponse(orders);
  } catch {
    return apiError('Failed to fetch orders', 500);
  }
});
