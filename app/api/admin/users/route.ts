import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError, paginate, paginationMeta } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    const where: any = { deletedAt: null };
    if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
    if (role) where.role = role;
    if (status) where.status = status;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, phone: true, role: true, status: true, emailVerified: true, lastLogin: true, createdAt: true },
      }),
    ]);

    return apiResponse({ users, meta: paginationMeta(total, page, limit) });
  } catch {
    return apiError('Failed to fetch users', 500);
  }
}, ['SUPER_ADMIN', 'SUB_ADMIN']);
