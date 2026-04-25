'use client';
import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  productId?: string;
  productTitle?: string;
}

export default function InquiryModal({ isOpen, onClose, vendorId, productId, productTitle }: InquiryModalProps) {
  const [form, setForm] = useState({ subject: productTitle ? `Inquiry for ${productTitle}` : '', message: '', quantity: '', unit: 'piece' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const token = useAuthStore((s) => s.token);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/inquiries', { vendorId, productId, ...form, quantity: form.quantity ? Number(form.quantity) : undefined }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold font-display">Send Inquiry</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Inquiry Sent!</h3>
            <p className="text-gray-500 text-sm">The vendor will respond to your inquiry shortly.</p>
            <button onClick={onClose} className="btn-primary mt-6 px-8">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {productTitle && <div className="bg-brand-50 rounded-lg p-3 text-sm text-brand-700">Product: <strong>{productTitle}</strong></div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} min="1" />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  {['piece', 'kg', 'ton', 'liter', 'meter', 'box', 'carton'].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea className="input" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe your requirement in detail..." required />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Send className="h-4 w-4" />}
                Send Inquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
