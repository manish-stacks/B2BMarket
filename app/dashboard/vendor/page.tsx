'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Package, MessageSquare, Eye, TrendingUp, Plus, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/utils/helpers';

export default function VendorDashboard() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [vendorData, setVendorData] = useState<any>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('/api/auth/me', { headers }),
      axios.get('/api/inquiries?limit=5', { headers }),
    ]).then(([me, inq]) => {
      setVendorData(me.data.data?.vendor);
      setInquiries(inq.data.data?.inquiries || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const statCards = [
    { label: 'Total Products', value: vendorData?.totalProducts || 0, icon: Package, color: 'blue', href: '/dashboard/vendor/products' },
    { label: 'Total Leads', value: vendorData?.totalLeads || 0, icon: MessageSquare, color: 'green', href: '/dashboard/vendor/inquiries' },
    { label: 'Profile Views', value: vendorData?.totalViews || 0, icon: Eye, color: 'purple', href: '/dashboard/vendor/analytics' },
    { label: 'Response Rate', value: '85%', icon: TrendingUp, color: 'orange', href: '/dashboard/vendor/inquiries' },
  ];

  const isApproved = vendorData?.status === 'APPROVED';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-display">Vendor Dashboard</h2>
            <p className="text-gray-500 text-sm mt-1">{vendorData?.companyName || 'Your Company'}</p>
          </div>
          {isApproved && (
            <Link href="/dashboard/vendor/products/new" className="btn-primary text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Link>
          )}
        </div>

        {!isApproved && vendorData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Profile Pending Approval</p>
              <p className="text-sm text-yellow-600 mt-0.5">Your vendor profile is being reviewed. You'll be able to add products once approved.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} href={href} className="card p-5 hover:shadow-md transition-all">
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 text-${color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Recent Inquiries</h3>
              <Link href="/dashboard/vendor/inquiries" className="text-sm text-brand-600 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {inquiries.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No inquiries yet</div>
              ) : inquiries.map((inq) => (
                <div key={inq.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{inq.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">From: {inq.buyer?.name}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${inq.status === 'RESPONDED' ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'}`}>{inq.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(inq.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Subscription Plan</h3>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl p-5 text-white">
                <p className="text-xs uppercase tracking-wide opacity-80">Current Plan</p>
                <p className="text-2xl font-bold font-display mt-1">FREE</p>
                <p className="text-sm opacity-80 mt-1">5 products · Basic profile</p>
                <Link href="/dashboard/vendor/subscription" className="mt-4 bg-white text-brand-700 font-semibold px-4 py-2 rounded-lg text-sm inline-block hover:bg-gray-50 transition-all">
                  Upgrade Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
