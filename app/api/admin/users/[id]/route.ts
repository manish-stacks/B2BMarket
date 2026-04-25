import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

export const PATCH = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const allowed = ['status', 'role', 'emailVerified'];
    const data: any = {};
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key];
    }

    const user = await prisma.user.update({ where: { id: params.id }, data });

    await prisma.adminLog.create({
      data: { adminId: req.user.userId, targetId: params.id, action: 'UPDATE_USER', entity: 'User', entityId: params.id, details: data },
    });

    return apiResponse(user);
  } catch {
    return apiError('Failed to update user', 500);
  }
}, ['SUPER_ADMIN', 'SUB_ADMIN']);

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.user.update({ where: { id: params.id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    await prisma.adminLog.create({
      data: { adminId: req.user.userId, targetId: params.id, action: 'DELETE_USER', entity: 'User', entityId: params.id },
    });
    return apiResponse({ message: 'User deleted' });
  } catch {
    return apiError('Failed to delete user', 500);
  }
}, ['SUPER_ADMIN']);
