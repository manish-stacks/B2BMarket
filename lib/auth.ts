// lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JwtPayload, Role } from '@/types';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refreshsecret-change-in-production';

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function extractTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookie = req.cookies.get('token');
  return cookie?.value || null;
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isAdminRole(role: Role): boolean {
  return role === 'SUPER_ADMIN' || role === 'SUB_ADMIN';
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: ['*'],
  SUB_ADMIN: [
    'users:read', 'users:update',
    'vendors:read', 'vendors:update',
    'products:read', 'products:update', 'products:delete',
    'categories:read', 'categories:create', 'categories:update',
    'inquiries:read',
    'reports:read',
  ],
  VENDOR: [
    'products:create', 'products:read', 'products:update', 'products:delete',
    'inquiries:read', 'inquiries:update',
    'chats:create', 'chats:read',
    'profile:update',
    'analytics:read',
  ],
  BUYER: [
    'products:read',
    'vendors:read',
    'inquiries:create', 'inquiries:read',
    'chats:create', 'chats:read',
    'wishlist:create', 'wishlist:read', 'wishlist:delete',
    'orders:create', 'orders:read',
  ],
};

export function hasPermission(role: Role, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes('*') || perms.includes(permission);
}
