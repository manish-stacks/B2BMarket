// app/api/admin/vendors/[id]/approve/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticateRequest, successResponse, errorResponse } from '@/lib/api-helpers';
import { sendEmail } from '@/lib/email';

const approveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  reason: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await authenticateRequest(req, ['SUPER_ADMIN', 'SUB_ADMIN']);
  if (error) return error;

  try {
    const body = await req.json();
    const data = approveSchema.parse(body);

    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!vendor) return errorResponse('Vendor not found', 404);

    const updated = await prisma.vendor.update({
      where: { id: params.id },
      data: { status: data.status as any },
    });

    await prisma.adminLog.create({
      data: {
        adminId: user!.id,
        targetId: vendor.userId,
        action: `${data.status}_VENDOR`,
        entity: 'vendor',
        details: JSON.stringify({ vendorId: vendor.id, reason: data.reason }),
      },
    });

    await prisma.notification.create({
      data: {
        userId: vendor.userId,
        title: `Vendor Account ${data.status === 'APPROVED' ? 'Approved' : data.status === 'REJECTED' ? 'Rejected' : 'Suspended'}`,
        message: data.status === 'APPROVED'
          ? 'Congratulations! Your vendor account has been approved. Start listing your products.'
          : `Your vendor account has been ${data.status.toLowerCase()}. ${data.reason ? `Reason: ${data.reason}` : ''}`,
        type: 'system',
        link: data.status === 'APPROVED' ? '/vendor/dashboard' : '/support',
      },
    });

    sendEmail({
      to: vendor.user.email,
      subject: `Vendor Account ${data.status} - IndiaB2B`,
      html: `<p>Dear ${vendor.user.name}, your vendor account has been ${data.status.toLowerCase()}. ${data.reason ? `<br>Reason: ${data.reason}` : ''}</p>`,
    });

    return successResponse(updated, `Vendor ${data.status.toLowerCase()} successfully`);
  } catch (error) {
    return errorResponse('Failed to update vendor status', 500);
  }
}
