import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
      include: { vendor: true },
    });
    if (!inquiry) return apiError('Inquiry not found', 404);

    const body = await req.json();

    if (req.user.role === 'VENDOR') {
      if (inquiry.vendor.userId !== req.user.userId) return apiError('Forbidden', 403);
      const updated = await prisma.inquiry.update({
        where: { id: params.id },
        data: { response: body.response, status: 'RESPONDED', respondedAt: new Date() },
      });
      await prisma.notification.create({
        data: { userId: inquiry.buyerId, title: 'Inquiry Response', message: 'A vendor responded to your inquiry', type: 'info', link: '/dashboard/buyer/inquiries' },
      });
      return apiResponse(updated);
    }

    if (['SUPER_ADMIN', 'SUB_ADMIN'].includes(req.user.role)) {
      const updated = await prisma.inquiry.update({ where: { id: params.id }, data: body });
      return apiResponse(updated);
    }

    return apiError('Forbidden', 403);
  } catch {
    return apiError('Failed to update inquiry', 500);
  }
});
