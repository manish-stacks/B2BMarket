'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import { useApi } from '@/hooks/useApi';
import { formatDate } from '@/utils/helpers';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  RESPONDED: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

export default function VendorInquiriesPage() {
  const { request } = useApi();
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    const res = await request('/api/inquiries');
    setInquiries(res?.inquiries || (Array.isArray(res) ? res : []));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? inquiries : inquiries.filter(i => i.status === filter);

  const handleRespond = async () => {
    if (!response.trim()) { showToast('Please enter a response', 'error'); return; }
    setResponding(true);
    const res = await request(`/api/inquiries/${selected.id}`, {
      method: 'PUT', body: JSON.stringify({ response }),
    });
    setResponding(false);
    if (res) {
      showToast('Response sent!', 'success');
      setSelected(null); setResponse(''); load();
    } else showToast('Failed to send response', 'error');
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-500 text-sm">Manage buyer inquiries</p>
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
          <p className="text-gray-500">No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inq: any) => (
            <div key={inq.id} className="card hover:shadow-md transition-shadow p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`badge ${STATUS_COLORS[inq.status] || 'bg-gray-100'}`}>{inq.status}</span>
                    <span className="text-sm text-gray-400">{formatDate(inq.createdAt)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{inq.subject}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{inq.message}</p>
                  <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                    <span>From: <strong className="text-gray-700">{inq.buyer?.name}</strong></span>
                    {inq.product && <span>Product: <strong className="text-gray-700">{inq.product.title}</strong></span>}
                    {inq.quantity && <span>Qty: <strong className="text-gray-700">{inq.quantity} {inq.unit}</strong></span>}
                  </div>
                  {inq.response && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs font-medium text-green-700 mb-1">Your Response:</p>
                      <p className="text-sm text-green-800">{inq.response}</p>
                    </div>
                  )}
                </div>
                {inq.status !== 'CLOSED' && (
                  <button onClick={() => { setSelected(inq); setResponse(inq.response || ''); }}
                    className="btn-primary text-sm py-2 px-4 flex-shrink-0">
                    {inq.status === 'PENDING' ? 'Respond' : 'Edit'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Respond to Inquiry</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">{selected.subject}</p>
                <p className="text-sm text-gray-600">{selected.message}</p>
              </div>
              <textarea value={response} onChange={e => setResponse(e.target.value)} rows={5}
                className="input resize-none" placeholder="Type your response..." />
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleRespond} disabled={responding} className="btn-primary">
                {responding ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
