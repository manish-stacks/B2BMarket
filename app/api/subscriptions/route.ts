import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';
import { createOrder } from '@/lib/razorpay';

const PLANS = {
  FREE: { price: 0, duration: 30, features: ['5 products', 'Basic profile', 'Email support'] },
  BASIC: { price: 999, duration: 30, features: ['50 products', 'Priority profile', 'Phone support', 'Lead notifications'] },
  PREMIUM: { price: 4999, duration: 365, features: ['Unlimited products', 'Featured listing', '24/7 support', 'Analytics', 'Verified badge'] },
  ENTERPRISE: { price: 19999, duration: 365, features: ['All Premium features', 'Dedicated account manager', 'API access', 'Custom branding'] },
};

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  return apiResponse({ plans: PLANS });
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user.role !== 'VENDOR') return apiError('Only vendors can subscribe', 403);
    const { plan } = await req.json();
    if (!PLANS[plan as keyof typeof PLANS]) return apiError('Invalid plan', 400);

    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
    if (!vendor) return apiError('Vendor not found', 404);

    const planData = PLANS[plan as keyof typeof PLANS];

    if (planData.price === 0) {
      const sub = await prisma.subscription.create({
        data: { vendorId: vendor.id, plan: plan as any, status: 'ACTIVE', price: 0, endDate: new Date(Date.now() + planData.duration * 86400000) },
      });
      return apiResponse(sub, 201);
    }

    const order = await createOrder(planData.price, `sub_${vendor.id}_${Date.now()}`);
    return apiResponse({ order, plan, price: planData.price });
  } catch {
    return apiError('Failed to create subscription', 500);
  }
}, ['VENDOR']);
