import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, apiResponse, apiError, paginate, paginationMeta } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';
import { generateSlug } from '@/utils/helpers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const vendorId = searchParams.get('vendorId') || '';
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 999999999;
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
    const featured = searchParams.get('featured') === 'true';
    const statusFilter = searchParams.get('status') || 'ACTIVE';

    const where: any = {
      status: statusFilter,
      deletedAt: null,
      price: { gte: minPrice, lte: maxPrice },
    };

    if (search) where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
    if (categoryId) where.categoryId = categoryId;
    if (vendorId) where.vendorId = vendorId;
    if (featured) where.isFeatured = true;

    const orderBy: any = {
      newest: { createdAt: 'desc' },
      popular: { viewCount: 'desc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
    }[sortBy] || { createdAt: 'desc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        ...paginate(page, limit),
        orderBy,
        include: {
          vendor: { select: { id: true, companyName: true, city: true, isVerified: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    return apiResponse({ products, meta: paginationMeta(total, page, limit) });
  } catch (err) {
    console.error(err);
    return apiError('Failed to fetch products', 500);
  }
}

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { title, description, price, categoryId, minOrderQty = 1, unit = 'Piece',
            stock, images = [], specifications, tags = [], status = 'ACTIVE' } = body;

    if (!title || !price || !categoryId) {
      return apiError('title, price, and categoryId are required', 400);
    }

    let vendorId: string;
    if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
      if (!vendor) return apiError('Vendor profile not found', 404);
      if (vendor.status !== 'APPROVED') return apiError('Vendor not approved yet', 403);
      vendorId = vendor.id;
    } else {
      vendorId = body.vendorId;
    }

    const slug = await generateSlug(title, prisma);
    const product = await prisma.product.create({
      data: { title, slug, description, price: Number(price), categoryId, vendorId,
              minOrderQty: Number(minOrderQty), unit, stock: stock ? Number(stock) : null,
              images, specifications, tags, status },
    });

    await prisma.vendor.update({ where: { id: vendorId }, data: { totalProducts: { increment: 1 } } });

    return apiResponse(product, 201);
  } catch (err) {
    console.error(err);
    return apiError('Failed to create product', 500);
  }
}, ['VENDOR', 'SUPER_ADMIN', 'SUB_ADMIN']);
