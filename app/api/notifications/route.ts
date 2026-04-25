import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({ where: { userId: req.user.userId, isRead: false } });
  return apiResponse({ notifications, unreadCount });
});

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  await prisma.notification.updateMany({ where: { userId: req.user.userId, isRead: false }, data: { isRead: true } });
  return apiResponse({ message: 'All notifications marked as read' });
});
