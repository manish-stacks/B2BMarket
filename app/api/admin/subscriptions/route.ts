import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
    return apiResponse({ subscriptions });
  } catch {
    return apiError('Failed to fetch subscriptions', 500);
  }
}, ['SUPER_ADMIN', 'SUB_ADMIN']);
