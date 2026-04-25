import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], status: 'ACTIVE', deletedAt: null },
      include: {
        vendor: {
          include: { user: { select: { name: true, phone: true } } },
        },
        category: true,
      },
    });

    if (!product) return apiError('Product not found', 404);

    await prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } });

    return apiResponse(product);
  } catch (err) {
    console.error('Product fetch error:', err);
    return apiError('Failed to fetch product', 500);
  }
}

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return apiError('Product not found', 404);

    if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
      if (!vendor || vendor.id !== product.vendorId) return apiError('Forbidden', 403);
    }

    const body = await req.json();
    const updated = await prisma.product.update({ where: { id: params.id }, data: body });
    return apiResponse(updated);
  } catch {
    return apiError('Failed to update product', 500);
  }
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return apiError('Product not found', 404);

    if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
      if (!vendor || vendor.id !== product.vendorId) return apiError('Forbidden', 403);
    }

    await prisma.product.update({ where: { id: params.id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    return apiResponse({ message: 'Product deleted successfully' });
  } catch {
    return apiError('Failed to delete product', 500);
  }
});
