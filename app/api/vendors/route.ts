import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiResponse, apiError, paginate, paginationMeta } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    const where: any = { status: 'APPROVED', deletedAt: null };
    if (search) where.companyName = { contains: search };
    if (city) where.city = { contains: city };

    const [total, vendors] = await Promise.all([
      prisma.vendor.count({ where }),
      prisma.vendor.findMany({
        where, ...paginate(page, limit), orderBy: { totalLeads: 'desc' },
        include: {
          user: { select: { name: true } },
          _count: { select: { products: { where: { status: 'ACTIVE', deletedAt: null } } } },
        },
      }),
    ]);
    return apiResponse({ vendors, meta: paginationMeta(total, page, limit) });
  } catch { return apiError('Failed to fetch vendors', 500); }
}
