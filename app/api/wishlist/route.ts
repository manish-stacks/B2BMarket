import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.user.userId },
    include: { product: { include: { vendor: { select: { companyName: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  return apiResponse(items);
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const { productId } = await req.json();
  if (!productId) return apiError('Product ID required', 400);
  const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId: req.user.userId, productId } } });
  if (existing) {
    await prisma.wishlist.delete({ where: { userId_productId: { userId: req.user.userId, productId } } });
    return apiResponse({ wishlisted: false });
  }
  await prisma.wishlist.create({ data: { userId: req.user.userId, productId } });
  return apiResponse({ wishlisted: true }, 201);
});
