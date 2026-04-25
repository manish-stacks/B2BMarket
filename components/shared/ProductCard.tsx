'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star, ShieldCheck } from 'lucide-react';
import { formatCurrency, truncate } from '@/utils/helpers';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images: string[];
    vendor: { companyName: string; city?: string; isVerified: boolean };
    category?: { name: string };
    viewCount?: number;
    minOrderQty?: number;
    unit?: string;
  };
  onWishlist?: (id: string) => void;
  wishlisted?: boolean;
}

export default function ProductCard({ product, onWishlist, wishlisted }: ProductCardProps) {
  const image = Array.isArray(product.images) ? product.images[0] : product.images;

  return (
    <div className="card hover:shadow-md transition-all duration-200 group">
      <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
        <Image
          src={image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.category && (
          <span className="absolute top-2 left-2 badge bg-white text-gray-600 text-xs shadow-sm">{product.category.name}</span>
        )}
        {onWishlist && (
          <button
            onClick={(e) => { e.preventDefault(); onWishlist(product.id); }}
            className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-all ${wishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
          >
            <Heart className="h-4 w-4" fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <Link href={`/marketplace/products/${product.slug}`}>
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.title}
          </h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-brand-600">{formatCurrency(product.price)}</span>
            {product.unit && <span className="text-xs text-gray-400">/{product.unit}</span>}
          </div>
          {product.minOrderQty && product.minOrderQty > 1 && (
            <p className="text-xs text-gray-400 mt-0.5">Min. order: {product.minOrderQty} {product.unit}</p>
          )}
          <div className="mt-2 pt-2 border-t border-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate flex items-center gap-1">
                  {product.vendor.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                  {product.vendor.companyName}
                </p>
                {product.vendor.city && (
                  <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                    <MapPin className="h-3 w-3" /> {product.vendor.city}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
