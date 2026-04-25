// app/api/admin/dashboard/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await authenticateRequest(req, ['SUPER_ADMIN', 'SUB_ADMIN']);
  if (error) return error;

  try {
    const [
      totalUsers, totalVendors, totalProducts, totalInquiries,
      pendingVendors, activeSubscriptions, recentInquiries,
      usersByRole, vendorsByStatus, monthlyStats,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.vendor.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      prisma.inquiry.count({ where: { deletedAt: null } }),
      prisma.vendor.count({ where: { status: 'PENDING' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE', plan: { not: 'FREE' } } }),
      prisma.inquiry.findMany({
        where: { deletedAt: null },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { name: true, email: true } },
          vendor: { select: { companyName: true } },
          product: { select: { title: true } },
        },
      }),
      prisma.user.groupBy({ by: ['role'], where: { deletedAt: null }, _count: true }),
      prisma.vendor.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
      // Last 6 months product creation stats
      prisma.$queryRaw<{ month: string; count: number }[]>`
        SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count
        FROM products
        WHERE deletedAt IS NULL AND createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month ASC
      `,
    ]);

    return successResponse({
      stats: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalInquiries,
        pendingVendors,
        activeSubscriptions,
      },
      usersByRole,
      vendorsByStatus,
      recentInquiries,
      monthlyStats,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse('Failed to fetch dashboard data', 500);
  }
}
