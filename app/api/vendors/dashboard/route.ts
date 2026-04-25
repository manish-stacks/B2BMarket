// app/api/vendors/dashboard/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await authenticateRequest(req, ['VENDOR']);
  if (error) return error;

  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: user!.id } });
    if (!vendor) return errorResponse('Vendor profile not found', 404);

    const [
      totalProducts,
      activeProducts,
      totalInquiries,
      openInquiries,
      totalOrders,
      recentInquiries,
      subscription,
      topProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { vendorId: vendor.id, deletedAt: null } }),
      prisma.product.count({ where: { vendorId: vendor.id, isActive: true, deletedAt: null } }),
      prisma.inquiry.count({ where: { vendorId: vendor.id, deletedAt: null } }),
      prisma.inquiry.count({ where: { vendorId: vendor.id, status: 'OPEN', deletedAt: null } }),
      prisma.order.count({ where: { vendorId: vendor.id, deletedAt: null } }),
      prisma.inquiry.findMany({
        where: { vendorId: vendor.id, deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, email: true, avatar: true } },
          product: { select: { id: true, title: true, images: true } },
        },
      }),
      prisma.subscription.findFirst({
        where: { vendorId: vendor.id, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { vendorId: vendor.id, deletedAt: null, isActive: true },
        take: 5,
        orderBy: { viewCount: 'desc' },
        select: { id: true, title: true, viewCount: true, inquiryCount: true, images: true },
      }),
    ]);

    return successResponse({
      vendor,
      stats: {
        totalProducts,
        activeProducts,
        totalInquiries,
        openInquiries,
        totalOrders,
        profileViews: vendor.profileViews,
        totalLeads: vendor.totalLeads,
        rating: vendor.rating,
      },
      recentInquiries,
      subscription,
      topProducts,
    });
  } catch (error) {
    console.error('Vendor dashboard error:', error);
    return errorResponse('Failed to fetch dashboard data', 500);
  }
}
