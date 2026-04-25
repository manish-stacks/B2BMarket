// lib/api-helpers.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { verifyToken, extractTokenFromRequest } from './auth';
import { Role, ApiResponse } from '@/types';
import prisma from './prisma';

export function successResponse<T>(data: T, message?: string, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, message } as ApiResponse<T>, { status });
}

export function errorResponse(error: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error } as ApiResponse, { status });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  } as ApiResponse<T[]>);
}

export function getPagination(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function handleZodError(error: ZodError): NextResponse {
  const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  return errorResponse(`Validation failed: ${messages}`, 422);
}

export async function authenticateRequest(req: NextRequest, allowedRoles?: Role[]) {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return { error: errorResponse('Unauthorized: No token provided', 401) };
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        vendor: { select: { id: true, status: true } },
      },
    });

    if (!user) {
      return { error: errorResponse('Unauthorized: User not found', 401) };
    }

    if (user.status !== 'ACTIVE') {
      return { error: errorResponse('Account is suspended or inactive', 403) };
    }

    if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
      return { error: errorResponse('Forbidden: Insufficient permissions', 403) };
    }

    return { user };
  } catch {
    return { error: errorResponse('Unauthorized: Invalid token', 401) };
  }
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}
