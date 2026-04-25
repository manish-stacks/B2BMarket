'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toaster';
import { formatCurrency } from '@/utils/helpers';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, Eye } from 'lucide-react';

export default function BuyerWishlistPage() {
  const { request } = useApi();
  const { showToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    request('/api/wishlist').then((res: any) => {
      setItems(Array.isArray(res) ? res : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: string) => {
    setRemoving(productId);
    await request('/api/wishlist', { method: 'POST', body: JSON.stringify({ productId }) });
    setItems(prev => prev.filter(i => i.productId !== productId));
    showToast('Removed from wishlist', 'info');
    setRemoving(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" /> Wishlist
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} saved {items.length === 1 ? 'product' : 'products'}</p>
        </div>
        {items.length > 0 && (
          <Link href="/marketplace" className="btn-secondary text-sm flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Browse More
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-24">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-10 w-10 text-red-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-400 text-sm mb-6">Save products you like and come back later</p>
          <Link href="/marketplace" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item: any) => {
            const p = item.product;
            if (!p) return null;
            return (
              <div key={item.productId} className="card p-0 overflow-hidden group hover:shadow-lg transition-all">
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                  }
                  <button onClick={() => handleRemove(item.productId)} disabled={removing === item.productId}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-all">
                    {removing === item.productId
                      ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <Trash2 className="h-4 w-4 text-red-400" />
                    }
                  </button>
                  {p.category?.name && (
                    <span className="absolute top-3 left-3 bg-white/90 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">{p.category.name}</span>
                  )}
                </div>
                <div className="p-4">
                  <Link href={`/marketplace/products/${p.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 hover:text-brand-600 transition-colors line-clamp-2 text-sm">{p.title}</h3>
                  </Link>
                  {p.vendor?.companyName && <p className="text-xs text-gray-400 mb-2">{p.vendor.companyName}</p>}
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <p className="text-lg font-bold text-brand-600">{formatCurrency(p.price)}</p>
                      <p className="text-xs text-gray-400">Min. {p.minOrderQty} {p.unit}</p>
                    </div>
                    <Link href={`/marketplace/products/${p.slug}`}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white px-3 py-2 rounded-lg transition-all">
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
