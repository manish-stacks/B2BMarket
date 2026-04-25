'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toaster';
import { formatCurrency, formatDate } from '@/utils/helpers';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  INACTIVE: 'bg-yellow-100 text-yellow-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-600',
};

export default function AdminProductsPage() {
  const { request } = useApi();
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15', adminView: 'true' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const res = await request(`/api/products?${params}`);
    if (res) { const list = res.products || (Array.isArray(res) ? res : []); const meta = res.meta || {}; setProducts(list); setTotal(meta.total || list.length || 0); }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (productId: string, status: string) => {
    setActionId(productId);
    const res = await request(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (res) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status } : p));
      showToast('Product updated', 'success');
    }
    setActionId(null);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    setActionId(productId);
    const res = await request(`/api/products/${productId}`, { method: 'DELETE' });
    if (res !== null) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast('Product deleted', 'success');
    }
    setActionId(null);
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{total} total products</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex gap-4 flex-wrap">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input flex-1 min-w-48" placeholder="Search products..." />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input w-40">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="INACTIVE">Inactive</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Views</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Added</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{p.vendor?.companyName || '—'}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{formatCurrency(p.price)}</td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{p.viewCount}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(p.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        {p.status === 'ACTIVE' ? (
                          <button onClick={() => handleStatusChange(p.id, 'INACTIVE')} disabled={actionId === p.id}
                            className="text-xs px-2.5 py-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg font-medium transition-colors">
                            Deactivate
                          </button>
                        ) : (
                          <button onClick={() => handleStatusChange(p.id, 'ACTIVE')} disabled={actionId === p.id}
                            className="text-xs px-2.5 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium transition-colors">
                            Activate
                          </button>
                        )}
                        <button onClick={() => handleDelete(p.id)} disabled={actionId === p.id}
                          className="text-xs px-2.5 py-1.5 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50">Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
