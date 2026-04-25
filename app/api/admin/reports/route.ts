import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authenticateRequest } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request, ['SUPER_ADMIN', 'SUB_ADMIN'])
  if (!auth.success) return errorResponse(auth.error!, auth.status!)

  try {
    const { searchParams } = new URL(request.url)
    const type  = searchParams.get('type') || 'overview'
    const from  = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(Date.now() - 30 * 86400000)
    const to    = searchParams.get('to')   ? new Date(searchParams.get('to')!)   : new Date()

    if (type === 'overview') {
      const [users, vendors, products, inquiries, subscriptions] = await Promise.all([
        prisma.user.groupBy({ by: ['role'], _count: true }),
        prisma.vendor.groupBy({ by: ['status'], _count: true }),
        prisma.product.count({ where: { deletedAt: null } }),
        prisma.inquiry.count({ where: { createdAt: { gte: from, lte: to } } }),
        prisma.subscription.groupBy({ by: ['plan', 'status'], _count: true }),
      ])
      return successResponse({ users, vendors, products, inquiries, subscriptions })
    }

    if (type === 'inquiries') {
      const data = await prisma.$queryRaw`
        SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') as date, COUNT(*) as count
        FROM inquiries
        WHERE createdAt BETWEEN ${from} AND ${to}
        GROUP BY date ORDER BY date ASC
      `
      return successResponse(data)
    }

    if (type === 'registrations') {
      const data = await prisma.$queryRaw`
        SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') as date, role, COUNT(*) as count
        FROM users
        WHERE createdAt BETWEEN ${from} AND ${to}
        GROUP BY date, role ORDER BY date ASC
      `
      return successResponse(data)
    }

    if (type === 'top-products') {
      const data = await prisma.product.findMany({
        where: { deletedAt: null },
        orderBy: { viewCount: 'desc' },
        take: 20,
        include: { vendor: { select: { companyName: true } }, category: true },
      })
      return successResponse(data)
    }

    return errorResponse('Invalid report type', 400)
  } catch (err) {
    console.error(err)
    return errorResponse('Failed to generate report', 500)
  }
}
