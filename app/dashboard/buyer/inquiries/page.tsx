'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { formatDate } from '@/utils/helpers';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  RESPONDED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

export default function BuyerInquiriesPage() {
  const { request } = useApi();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    request('/api/inquiries').then((res: any) => {
      setInquiries(res?.inquiries || (Array.isArray(res) ? res : []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? inquiries : inquiries.filter(i => i.status === filter);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Inquiries</h1>
          <p className="text-gray-500 text-sm">Track your product inquiries and responses</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'RESPONDED', 'CLOSED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">📩</div>
          <p className="text-gray-500 mb-4">No inquiries yet</p>
          <Link href="/marketplace" className="btn-primary inline-block">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inq: any) => (
            <div key={inq.id} className="card hover:shadow-md transition-shadow cursor-pointer p-4" onClick={() => setSelected(inq)}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`badge ${STATUS_COLORS[inq.status] || 'bg-gray-100 text-gray-600'}`}>{inq.status}</span>
                    <span className="text-sm text-gray-400">{formatDate(inq.createdAt)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{inq.subject}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{inq.message}</p>
                  <div className="flex gap-4 text-xs text-gray-400 mt-2 flex-wrap">
                    {inq.vendor && <span>Vendor: <strong className="text-gray-600">{inq.vendor.companyName}</strong></span>}
                    {inq.product && <span>Product: <strong className="text-gray-600">{inq.product.title}</strong></span>}
                    {inq.quantity && <span>Qty: <strong className="text-gray-600">{inq.quantity} {inq.unit}</strong></span>}
                  </div>
                </div>
                {inq.status === 'RESPONDED' && <span className="ml-4 w-2.5 h-2.5 bg-green-400 rounded-full flex-shrink-0 mt-1" />}
              </div>
              {inq.response && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl">
                  <p className="text-xs font-semibold text-green-700 mb-1">Vendor Response</p>
                  <p className="text-sm text-green-800 line-clamp-2">{inq.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Inquiry Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <span className={`badge ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Subject</p>
                <p className="font-semibold text-gray-900">{selected.subject}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Message</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selected.message}</p>
              </div>
              {selected.vendor && <div><p className="text-xs font-medium text-gray-500 uppercase mb-1">Vendor</p><p className="text-gray-900">{selected.vendor.companyName}</p></div>}
              {selected.response && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs font-semibold text-green-700 mb-2">Vendor Response</p>
                  <p className="text-sm text-green-900 leading-relaxed">{selected.response}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
