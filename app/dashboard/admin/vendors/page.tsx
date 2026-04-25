'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toaster';
import { formatDate } from '@/utils/helpers';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-gray-100 text-gray-700',
};

export default function AdminVendorsPage() {
  const { request } = useApi();
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (filter) params.set('status', filter);
    const res = await request(`/api/admin/vendors?${params}`);
    if (res) { const list = res.vendors || (Array.isArray(res) ? res : []); const meta = res.meta || {}; setVendors(list); setTotal(meta.total || list.length || 0); }
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (vendorId: string, status: string, reason?: string) => {
    setActionId(vendorId);
    const res = await request(`/api/admin/vendors/${vendorId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason: reason }),
    });
    if (res) {
      setVendors(prev => prev.filter(v => v.id !== vendorId));
      showToast(`Vendor ${status.toLowerCase()}!`, 'success');
      setShowRejectModal(false);
      setSelected(null);
    } else {
      showToast('Action failed', 'error');
    }
    setActionId(null);
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500 text-sm">{total} {filter.toLowerCase()} vendors</p>
        </div>
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : vendors.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-gray-400">No {filter.toLowerCase()} vendors</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vendors.map((v: any) => (
            <div key={v.id} className="card hover:shadow-md transition-shadow p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {v.logo
                      ? <img src={v.logo} alt="" className="w-full h-full object-cover" />
                      : <span className="text-lg">🏢</span>
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{v.companyName}</h3>
                      <span className={`badge text-xs ${STATUS_COLORS[v.status]}`}>{v.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{v.user?.email}</p>
                    <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                      {v.businessType && <span>Type: {v.businessType}</span>}
                      {v.city && <span>📍 {v.city}, {v.state}</span>}
                      {v.gstNumber && <span>GST: {v.gstNumber}</span>}
                      <span>Registered: {formatDate(v.createdAt)}</span>
                    </div>
                    {v.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{v.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {v.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleAction(v.id, 'APPROVED')} disabled={actionId === v.id}
                        className="btn-primary text-sm py-2 px-4">
                        {actionId === v.id ? '...' : 'Approve'}
                      </button>
                      <button onClick={() => { setSelected(v); setShowRejectModal(true); }} disabled={actionId === v.id}
                        className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium">
                        Reject
                      </button>
                    </>
                  )}
                  {v.status === 'APPROVED' && (
                    <button onClick={() => handleAction(v.id, 'SUSPENDED')} disabled={actionId === v.id}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
                      Suspend
                    </button>
                  )}
                  {(v.status === 'REJECTED' || v.status === 'SUSPENDED') && (
                    <button onClick={() => handleAction(v.id, 'APPROVED')} disabled={actionId === v.id}
                      className="btn-primary text-sm py-2 px-4">
                      Re-approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-50">Prev</button>
          <span className="flex items-center px-4 text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Reject Vendor</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">You are rejecting <strong>{selected.companyName}</strong>. Please provide a reason:</p>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                rows={3} className="input resize-none" placeholder="Reason for rejection (optional, will be emailed to vendor)" />
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowRejectModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleAction(selected.id, 'REJECTED', rejectReason)}
                disabled={actionId === selected.id}
                className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold text-sm">
                {actionId === selected.id ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
