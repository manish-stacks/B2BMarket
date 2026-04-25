import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';
import { verifyPaymentSignature } from '@/lib/razorpay';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json();

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return apiError('Invalid payment signature', 400);

    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
    if (!vendor) return apiError('Vendor not found', 404);

    const PLAN_DURATION: Record<string, number> = { FREE: 30, BASIC: 30, PREMIUM: 365, ENTERPRISE: 365 };
    const PLAN_PRICE: Record<string, number> = { FREE: 0, BASIC: 999, PREMIUM: 4999, ENTERPRISE: 19999 };
    const days = PLAN_DURATION[planId] || 30;
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.create({
      data: {
        vendorId: vendor.id,
        plan: planId as any,
        status: 'ACTIVE',
        price: PLAN_PRICE[planId] || 0,
        endDate,
        razorpayOrderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },
    });

    await prisma.payment.create({
      data: {
        amount: PLAN_PRICE[planId] || 0,
        currency: 'INR',
        status: 'COMPLETED',
        razorpayOrderId: razorpay_order_id,
        razorpayId: razorpay_payment_id,
        subscriptionId: subscription.id,
      },
    });

    return apiResponse(subscription);
  } catch (err) {
    console.error(err);
    return apiError('Payment verification failed', 500);
  }
});
