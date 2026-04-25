import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        products: { where: { status: 'ACTIVE', deletedAt: null }, take: 12, include: { category: true } },
        subscriptions: { where: { status: 'ACTIVE' }, take: 1 },
      },
    });
    if (!vendor) return apiError('Vendor not found', 404);
    await prisma.vendor.update({ where: { id: vendor.id }, data: { totalViews: { increment: 1 } } });
    return apiResponse(vendor);
  } catch { return apiError('Failed to fetch vendor', 500); }
}

export const PATCH = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { id: params.id } });
    if (!vendor) return apiError('Vendor not found', 404);
    if (vendor.userId !== req.user.userId && !['SUPER_ADMIN', 'SUB_ADMIN'].includes(req.user.role)) {
      return apiError('Forbidden', 403);
    }
    const body = await req.json();
    const allowed = ['companyName','description','website','gstNumber','businessType',
      'employeeCount','yearEstablished','address','city','state','pincode','phone','whatsapp','logo'];
    const data: any = {};
    for (const key of allowed) { if (body[key] !== undefined) data[key] = body[key]; }
    const updated = await prisma.vendor.update({ where: { id: params.id }, data });
    return apiResponse(updated);
  } catch { return apiError('Failed to update vendor', 500); }
});
