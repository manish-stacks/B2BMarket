// app/api/chats/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticateRequest, successResponse, errorResponse, handleZodError, getPagination } from '@/lib/api-helpers';

const sendMessageSchema = z.object({
  receiverId: z.string(),
  message: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'file']).default('text'),
  fileUrl: z.string().optional(),
});

// Get conversations list
export async function GET(req: NextRequest) {
  const { user, error } = await authenticateRequest(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const withUserId = searchParams.get('with');
    const { skip, limit } = getPagination(req);

    if (withUserId) {
      // Get messages with a specific user
      const messages = await prisma.chat.findMany({
        where: {
          deletedAt: null,
          OR: [
            { senderId: user!.id, receiverId: withUserId },
            { senderId: withUserId, receiverId: user!.id },
          ],
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
      });

      // Mark received messages as read
      await prisma.chat.updateMany({
        where: { senderId: withUserId, receiverId: user!.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });

      return successResponse(messages);
    }

    // Get unique conversation partners
    const sentTo = await prisma.chat.findMany({
      where: { senderId: user!.id, deletedAt: null },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });

    const receivedFrom = await prisma.chat.findMany({
      where: { receiverId: user!.id, deletedAt: null },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const partnerIds = [
      ...new Set([
        ...sentTo.map((m) => m.receiverId),
        ...receivedFrom.map((m) => m.senderId),
      ]),
    ].filter((id) => id !== user!.id);

    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const lastMessage = await prisma.chat.findFirst({
          where: {
            deletedAt: null,
            OR: [
              { senderId: user!.id, receiverId: partnerId },
              { senderId: partnerId, receiverId: user!.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { id: true, name: true, avatar: true } } },
        });

        const unreadCount = await prisma.chat.count({
          where: { senderId: partnerId, receiverId: user!.id, isRead: false },
        });

        const partner = await prisma.user.findUnique({
          where: { id: partnerId },
          select: {
            id: true, name: true, avatar: true, role: true,
            vendor: { select: { companyName: true, slug: true } },
          },
        });

        return { partner, lastMessage, unreadCount };
      })
    );

    return successResponse(conversations.sort((a, b) =>
      new Date(b.lastMessage?.createdAt || 0).getTime() - new Date(a.lastMessage?.createdAt || 0).getTime()
    ));
  } catch (error) {
    console.error('Chat fetch error:', error);
    return errorResponse('Failed to fetch chats', 500);
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await authenticateRequest(req);
  if (error) return error;

  try {
    const body = await req.json();
    const data = sendMessageSchema.parse(body);

    const receiver = await prisma.user.findUnique({ where: { id: data.receiverId, deletedAt: null } });
    if (!receiver) return errorResponse('Receiver not found', 404);

    if (data.receiverId === user!.id) return errorResponse('Cannot send message to yourself', 400);

    const message = await prisma.chat.create({
      data: {
        senderId: user!.id,
        receiverId: data.receiverId,
        message: data.message,
        messageType: data.messageType,
        fileUrl: data.fileUrl,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: data.receiverId,
        title: 'New Message',
        message: `${message.sender.name} sent you a message`,
        type: 'chat',
        link: `/messages?with=${user!.id}`,
      },
    });

    return successResponse(message, 'Message sent', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return handleZodError(error);
    return errorResponse('Failed to send message', 500);
  }
}
