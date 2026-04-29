'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/shared/ProductCard';
import { Search, SlidersHorizontal, ChevronDown, Loader2, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
];

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    page: 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      params.set('sortBy', filters.sortBy);
      params.set('page', String(filters.page));
      params.set('limit', '24');

      const res = await axios.get(`/api/products?${params}`);
      setProducts(res.data.data.products);
      setMeta(res.data.data.meta);
    } catch { } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    axios.get('/api/categories?flat=true').then((r) => setCategories(r.data.data));
  }, []);

  const handleWishlist = async (productId: string) => {
    if (!token) { router.push('/auth/login'); return; }
    try {
      const res = await axios.post('/api/wishlist', { productId }, { headers: { Authorization: `Bearer ${token}` } });
      setWishlist((prev) => {
        const next = new Set(prev);
        res.data.data.wishlisted ? next.add(productId) : next.delete(productId);
        return next;
      });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block space-y-4">
            <div className="card p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Category</label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button onClick={() => setFilters((f) => ({ ...f, categoryId: '', page: 1 }))}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded-lg ${!filters.categoryId ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                      All Categories
                    </button>
                    {categories.filter(c => !c.parentId).map((cat: any) => (
                      <button key={cat.id} onClick={() => setFilters((f) => ({ ...f, categoryId: cat.id, page: 1 }))}
                        className={`w-full text-left text-sm px-2 py-1.5 rounded-lg ${filters.categoryId === cat.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Price Range (₹)</label>
                  <div className="flex gap-2">
                    <input type="number" className="input text-sm" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value, page: 1 }))} />
                    <input type="number" className="input text-sm" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value, page: 1 }))} />
                  </div>
                </div>
                <button onClick={() => setFilters({ search: '', categoryId: '', minPrice: '', maxPrice: '', sortBy: 'newest', page: 1 })}
                  className="w-full text-sm text-red-500 hover:text-red-700 font-medium">
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input className="input pl-9" placeholder="Search products..." value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} />
              </div>
              <select className="input w-auto"
                value={filters.sortBy}
                onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value, page: 1 }))}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${meta.total.toLocaleString()} products found`}</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">No products found</p>
                <p className="text-gray-300 text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((p) => <ProductCard key={p.id} product={p} onWishlist={handleWishlist} wishlisted={wishlist.has(p.id)} />)}
                </div>
                {meta.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.min(meta.totalPages, 7) }).map((_, i) => (
                      <button key={i} onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${meta.page === i + 1 ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-500'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
