'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Edit, Trash2, Eye, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function VendorProducts() {
  const token = useAuthStore((s) => s.token);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const me = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      const vendorId = me.data.data?.vendor?.id;
      if (!vendorId) return;
      const res = await axios.get(`/api/products?vendorId=${vendorId}&limit=100`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data.data.products || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [token]);

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch { alert('Failed to delete product'); } finally { setDeleting(null); }
  };

  const filtered = products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-gray-900">My Products</h2>
          <Link href="/dashboard/vendor/products/new" className="btn-primary text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input pl-9 max-w-sm" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 mb-4">No products yet</p>
            <Link href="/dashboard/vendor/products/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Views</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p) => {
                    const img = Array.isArray(p.images) ? p.images[0] : p.images;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {img && <Image src={img} alt={p.title} width={40} height={40} className="object-cover w-full h-full" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-xs">{p.title}</p>
                              <p className="text-xs text-gray-400">Added {formatDate(p.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.category?.name}</td>
                        <td className="px-4 py-3 font-semibold text-brand-600">{formatCurrency(p.price)}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`badge ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{p.viewCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/marketplace/products/${p.slug}`} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link href={`/dashboard/vendor/products/${p.id}/edit`} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-500 hover:text-blue-600">
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600">
                              {deleting === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
