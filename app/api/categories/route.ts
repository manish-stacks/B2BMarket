import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const flat = searchParams.get('flat') === 'true';

    if (flat) {
      const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
      return apiResponse(categories);
    }

    const categories = await prisma.category.findMany({
      where: { parentId: parentId || null, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        _count: { select: { products: { where: { status: 'ACTIVE', deletedAt: null } } } },
      },
    });
    return apiResponse(categories);
  } catch {
    return apiError('Failed to fetch categories', 500);
  }
}
