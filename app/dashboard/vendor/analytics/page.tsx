'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/utils/helpers';

const StatCard = ({ label, value, change, icon }: any) => (
  <div className="card p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change !== undefined && (
          <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% this month
          </p>
        )}
      </div>
      <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-xl">{icon}</div>
    </div>
  </div>
);

const MiniBar = ({ value, max, label }: { value: number; max: number; label: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm text-gray-600 w-24 truncate">{label}</span>
    <div className="flex-1 bg-gray-100 rounded-full h-2">
      <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
    <span className="text-sm font-medium text-gray-700 w-10 text-right">{value}</span>
  </div>
);

export default function VendorAnalyticsPage() {
  const { request } = useApi();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const meRes = await request('/api/auth/me');
      const vendorId = meRes?.vendor?.id || user?.vendor?.id;
      if (!vendorId) { setLoading(false); return; }
      const [vendorRes, inqRes, prodRes] = await Promise.all([
        request(`/api/vendors/${vendorId}`),
        request('/api/inquiries'),
        request(`/api/products?vendorId=${vendorId}&limit=100`),
      ]);

      if (vendorRes || inqRes || prodRes) {
        const vendor = vendorRes;
        const inquiries = (inqRes?.inquiries || (Array.isArray(inqRes) ? inqRes : []));
        const products = (prodRes?.products || (Array.isArray(prodRes) ? prodRes : []));

        const responded = inquiries.filter((i: any) => i.status !== 'PENDING').length;
        const responseRate = inquiries.length ? Math.round((responded / inquiries.length) * 100) : 0;
        const topProducts = [...products].sort((a: any, b: any) => b.viewCount - a.viewCount).slice(0, 5);
        const maxViews = topProducts[0]?.viewCount || 1;

        setAnalytics({
          totalViews: vendor?.totalViews || 0,
          totalLeads: vendor?.totalLeads || 0,
          totalProducts: products.length,
          responseRate,
          inquiries,
          topProducts,
          maxViews,
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm">Track your store performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Profile Views" value={analytics?.totalViews?.toLocaleString() || 0} change={12} icon="👁️" />
        <StatCard label="Total Leads" value={analytics?.totalLeads?.toLocaleString() || 0} change={8} icon="📩" />
        <StatCard label="Active Products" value={analytics?.totalProducts || 0} icon="📦" />
        <StatCard label="Response Rate" value={`${analytics?.responseRate || 0}%`} icon="⚡" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Views */}
        <div className="card p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Products by Views</h2>
          {analytics?.topProducts?.length ? (
            <div className="space-y-4">
              {analytics.topProducts.map((p: any) => (
                <MiniBar key={p.id} label={p.name} value={p.viewCount} max={analytics.maxViews} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No product data yet</p>
          )}
        </div>

        {/* Inquiry Breakdown */}
        <div className="card p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Inquiry Status</h2>
          {analytics?.inquiries?.length ? (
            <div className="space-y-4">
              {['PENDING', 'RESPONDED', 'CLOSED'].map(status => {
                const count = analytics.inquiries.filter((i: any) => i.status === status).length;
                const pct = analytics.inquiries.length ? Math.round((count / analytics.inquiries.length) * 100) : 0;
                const colors: Record<string, string> = { PENDING: 'bg-yellow-400', RESPONDED: 'bg-blue-500', CLOSED: 'bg-gray-400' };
                return (
                  <div key={status}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">{status}</span>
                      <span className="text-sm font-medium">{count} ({pct}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div className={`${colors[status]} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No inquiries yet</p>
          )}
        </div>

        {/* Recent Inquiries Timeline */}
        <div className="card lg:col-span-2 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Inquiry Activity</h2>
          {analytics?.inquiries?.slice(0, 8).length ? (
            <div className="space-y-3">
              {analytics.inquiries.slice(0, 8).map((inq: any) => (
                <div key={inq.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    inq.status === 'PENDING' ? 'bg-yellow-400' :
                    inq.status === 'RESPONDED' ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{inq.subject}</p>
                    <p className="text-xs text-gray-500">from {inq.buyer?.name}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No inquiry data yet</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
