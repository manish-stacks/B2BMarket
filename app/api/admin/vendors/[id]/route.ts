import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';
import { sendEmail } from '@/lib/email';

export const PATCH = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { status, isVerified } = await req.json();
    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: { ...(status && { status }), ...(isVerified !== undefined && { isVerified }), },
      include: { user: true },
    });

    if (status === 'APPROVED') {
      await prisma.notification.create({ data: { userId: vendor.userId, title: 'Vendor Approved!', message: 'Your vendor profile has been approved.', type: 'success' } });
      sendEmail({ to: vendor.user.email, subject: 'Your vendor profile is approved!', html: `<p>Hi ${vendor.user.name}, your vendor profile on B2B Marketplace has been approved. Start adding products now!</p>` }).catch(console.error);
    }

    await prisma.adminLog.create({ data: { adminId: req.user.userId, action: 'UPDATE_VENDOR', entity: 'Vendor', entityId: params.id, details: { status, isVerified } } });
    return apiResponse(vendor);
  } catch { return apiError('Failed to update vendor', 500); }
}, ['SUPER_ADMIN', 'SUB_ADMIN']);
