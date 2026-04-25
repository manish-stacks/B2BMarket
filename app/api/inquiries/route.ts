import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError, paginate, paginationMeta } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';
import { inquirySchema } from '@/lib/validations';
import { sendEmail, emailTemplates } from '@/lib/email';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');

    let where: any = {};
    if (req.user.role === 'BUYER') where.buyerId = req.user.userId;
    else if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
      if (!vendor) return apiError('Vendor not found', 404);
      where.vendorId = vendor.id;
    }
    if (status) where.status = status;

    const [total, inquiries] = await Promise.all([
      prisma.inquiry.count({ where }),
      prisma.inquiry.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, email: true, phone: true } },
          vendor: { select: { id: true, companyName: true } },
          product: { select: { id: true, title: true, images: true } },
        },
      }),
    ]);

    return apiResponse({ inquiries, meta: paginationMeta(total, page, limit) });
  } catch {
    return apiError('Failed to fetch inquiries', 500);
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user.role !== 'BUYER') return apiError('Only buyers can send inquiries', 403);

    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    const vendor = await prisma.vendor.findUnique({
      where: { id: parsed.data.vendorId },
      include: { user: true },
    });
    if (!vendor) return apiError('Vendor not found', 404);

    const buyer = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!buyer) return apiError('User not found', 404);

    const inquiry = await prisma.inquiry.create({
      data: { ...parsed.data, buyerId: req.user.userId },
      include: { product: { select: { title: true } } },
    });

    await prisma.vendor.update({ where: { id: parsed.data.vendorId }, data: { totalLeads: { increment: 1 } } });

    // Notifications
    await prisma.notification.create({
      data: { userId: vendor.userId, title: 'New Inquiry', message: `${buyer.name} sent an inquiry`, type: 'info', link: '/dashboard/vendor/inquiries' },
    });

    const productTitle = inquiry.product?.title || 'your product';
    sendEmail({ to: vendor.user.email, subject: 'New Inquiry Received', html: emailTemplates.inquiryReceived(vendor.companyName, productTitle, buyer.name) }).catch(console.error);

    return apiResponse(inquiry, 201);
  } catch {
    return apiError('Failed to send inquiry', 500);
  }
});
