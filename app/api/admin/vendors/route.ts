import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError, paginate, paginationMeta } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    const where: any = { deletedAt: null };
    if (status) where.status = status;

    const [total, vendors] = await Promise.all([
      prisma.vendor.count({ where }),
      prisma.vendor.findMany({
        where, ...paginate(page, limit), orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true, phone: true } }, _count: { select: { products: true } } },
      }),
    ]);
    return apiResponse({ vendors, meta: paginationMeta(total, page, limit) });
  } catch { return apiError('Failed to fetch vendors', 500); }
}, ['SUPER_ADMIN', 'SUB_ADMIN']);
