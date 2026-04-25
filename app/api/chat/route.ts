import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get('userId');

    if (otherUserId) {
      // Get thread between two users
      const messages = await prisma.chat.findMany({
        where: {
          OR: [
            { senderId: req.user.userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: req.user.userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: 100,
      });
      // Mark received messages as read
      await prisma.chat.updateMany({
        where: { senderId: otherUserId, receiverId: req.user.userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return apiResponse(messages);
    }

    // Get all conversations - latest message per unique partner
    const allMessages = await prisma.chat.findMany({
      where: {
        OR: [{ senderId: req.user.userId }, { receiverId: req.user.userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // Build unique conversation list
    const convMap = new Map<string, any>();
    for (const msg of allMessages) {
      const otherId = msg.senderId === req.user.userId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === req.user.userId ? msg.receiver : msg.sender;
      if (!convMap.has(otherId)) {
        const unreadCount = allMessages.filter(
          m => m.senderId === otherId && m.receiverId === req.user.userId && !m.isRead
        ).length;
        convMap.set(otherId, {
          otherUserId: otherId,
          otherUser,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount,
        });
      }
    }

    return apiResponse(Array.from(convMap.values()));
  } catch (err) {
    console.error(err);
    return apiError('Failed to fetch messages', 500);
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { receiverId, message } = await req.json();
    if (!receiverId || !message?.trim()) return apiError('Receiver and message are required', 400);

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) return apiError('Receiver not found', 404);

    const chat = await prisma.chat.create({
      data: { senderId: req.user.userId, receiverId, message: message.trim() },
    });

    return apiResponse(chat, 201);
  } catch (err) {
    console.error(err);
    return apiError('Failed to send message', 500);
  }
});
