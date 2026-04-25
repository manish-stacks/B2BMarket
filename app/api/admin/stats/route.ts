import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const [
      totalUsers, totalVendors, totalProducts, totalInquiries,
      pendingVendors, activeSubscriptions, recentUsers, recentVendors
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.vendor.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      prisma.inquiry.count(),
      prisma.vendor.count({ where: { status: 'PENDING' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.vendor.findMany({ where: { status: 'PENDING' }, take: 5, include: { user: { select: { name: true, email: true } } } }),
    ]);

    const roleBreakdown = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    return apiResponse({
      stats: { totalUsers, totalVendors, totalProducts, totalInquiries, pendingVendors, activeSubscriptions },
      recentUsers,
      recentVendors,
      roleBreakdown,
    });
  } catch {
    return apiError('Failed to fetch stats', 500);
  }
}, ['SUPER_ADMIN', 'SUB_ADMIN']);
