'use client';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toaster';
import { formatDate } from '@/utils/helpers';
import { MessageSquare, Search, Eye, X } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  RESPONDED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

export default function AdminInquiriesPage() {
  const { request } = useApi();
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter) params.set('status', statusFilter);
    const res = await request(`/api/inquiries?${params}`);
    const list = res?.inquiries || (Array.isArray(res) ? res : []);
    const filtered = search
      ? list.filter((i: any) =>
          i.subject?.toLowerCase().includes(search.toLowerCase()) ||
          i.buyer?.name?.toLowerCase().includes(search.toLowerCase()) ||
          i.vendor?.companyName?.toLowerCase().includes(search.toLowerCase())
        )
      : list;
    setInquiries(filtered);
    setTotal(res?.meta?.total || filtered.length);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleClose = async (id: string) => {
    const res = await request(`/api/inquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'CLOSED' }),
    });
    if (res) {
      showToast('Inquiry closed', 'success');
      setSelected(null);
      load();
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-brand-600" /> Inquiries
          </h1>
          <p className="text-gray-500 text-sm">{total} total inquiries across all vendors</p>
        </div>
        {/* Status filters */}
        <div className="flex gap-2 flex-wrap">
          {['', 'PENDING', 'RESPONDED', 'CLOSED'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === s ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9" placeholder="Search by subject, buyer, or vendor..." />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="card text-center py-20">
          <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No inquiries found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Buyer</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inquiries.map((inq: any) => (
                <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 line-clamp-1 max-w-xs">{inq.subject}</p>
                    {inq.product && <p className="text-xs text-gray-400">{inq.product.title}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 text-xs">{inq.buyer?.name}</p>
                    <p className="text-gray-400 text-xs">{inq.buyer?.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">{inq.vendor?.companyName || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`badge text-xs ${STATUS_COLORS[inq.status] || 'bg-gray-100 text-gray-600'}`}>{inq.status}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">{formatDate(inq.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setSelected(inq)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 hover:bg-brand-50 hover:text-brand-600 rounded-lg font-medium transition-colors">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Inquiry Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className={`badge ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                <span className="text-sm text-gray-400">{formatDate(selected.createdAt)}</span>
              </div>
              <div><p className="text-xs font-semibold text-gray-400 uppercase mb-1">Subject</p><p className="font-semibold text-gray-900">{selected.subject}</p></div>
              <div><p className="text-xs font-semibold text-gray-400 uppercase mb-1">Message</p><p className="text-sm text-gray-700 leading-relaxed">{selected.message}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs font-semibold text-gray-400 uppercase mb-1">Buyer</p><p className="text-sm font-medium text-gray-900">{selected.buyer?.name}</p><p className="text-xs text-gray-400">{selected.buyer?.email}</p></div>
                {selected.vendor && <div><p className="text-xs font-semibold text-gray-400 uppercase mb-1">Vendor</p><p className="text-sm font-medium text-gray-900">{selected.vendor.companyName}</p></div>}
              </div>
              {selected.quantity && <div><p className="text-xs font-semibold text-gray-400 uppercase mb-1">Quantity</p><p className="text-sm text-gray-900">{selected.quantity} {selected.unit}</p></div>}
              {selected.response && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs font-semibold text-green-700 mb-2">Vendor Response</p>
                  <p className="text-sm text-green-900">{selected.response}</p>
                </div>
              )}
            </div>
            {selected.status !== 'CLOSED' && (
              <div className="p-6 border-t border-gray-100 flex justify-end">
                <button onClick={() => handleClose(selected.id)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold text-sm">
                  Mark as Closed
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
