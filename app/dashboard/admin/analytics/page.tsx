'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { formatCurrency } from '@/utils/helpers';
import { BarChart2, TrendingUp, Users, Package, MessageSquare, CreditCard } from 'lucide-react';

const Bar = ({ value, max, label, color = 'bg-brand-500' }: any) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-gray-500 w-24 truncate flex-shrink-0">{label}</span>
    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${max ? Math.round((value / max) * 100) : 0}%` }} />
    </div>
    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{value}</span>
  </div>
);

export default function AdminAnalyticsPage() {
  const { request } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [statsRes, subsRes, inqRes] = await Promise.all([
        request('/api/admin/stats'),
        request('/api/admin/subscriptions'),
        request('/api/inquiries?limit=100'),
      ]);

      const stats = statsRes?.stats || {};
      const subs = subsRes?.subscriptions || (Array.isArray(subsRes) ? subsRes : []);
      const inquiries = inqRes?.inquiries || (Array.isArray(inqRes) ? inqRes : []);
      const roleBreakdown = statsRes?.roleBreakdown || [];

      // Revenue
      const revenue = subs.filter((s: any) => s.status === 'ACTIVE').reduce((sum: number, s: any) => sum + Number(s.price || 0), 0);

      // Inquiry status breakdown
      const inqByStatus: Record<string, number> = {};
      inquiries.forEach((i: any) => { inqByStatus[i.status] = (inqByStatus[i.status] || 0) + 1; });

      // Plan breakdown
      const planBreakdown: Record<string, number> = {};
      subs.forEach((s: any) => { planBreakdown[s.plan] = (planBreakdown[s.plan] || 0) + 1; });
      const maxPlan = Math.max(...Object.values(planBreakdown) as number[], 1);

      // Role breakdown
      const roleMap: Record<string, number> = {};
      roleBreakdown.forEach((r: any) => { roleMap[r.role] = r._count?.role || 0; });
      const maxRole = Math.max(...Object.values(roleMap) as number[], 1);

      setData({ stats, revenue, inqByStatus, planBreakdown, maxPlan, roleMap, maxRole, totalInquiries: inquiries.length });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const s = data?.stats || {};

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-brand-600" /> Platform Analytics
        </h1>
        <p className="text-gray-500 text-sm">Overview of platform performance</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users', value: s.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+12%' },
          { label: 'Active Vendors', value: s.totalVendors || 0, icon: Package, color: 'text-green-600', bg: 'bg-green-50', change: '+8%' },
          { label: 'Total Products', value: s.totalProducts || 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', change: '+23%' },
          { label: 'Total Inquiries', value: s.totalInquiries || 0, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50', change: '+5%' },
          { label: 'Active Subscriptions', value: s.activeSubscriptions || 0, icon: CreditCard, color: 'text-pink-600', bg: 'bg-pink-50', change: '+3%' },
          { label: 'Est. Monthly Revenue', value: formatCurrency(data?.revenue || 0), icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50', change: '+18%' },
        ].map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`${bg} p-2.5 rounded-xl`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{change}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* User roles */}
        <div className="card p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-5">User Distribution by Role</h3>
          <div className="space-y-3">
            {Object.entries(data?.roleMap || {}).map(([role, count]: any) => {
              const COLORS: Record<string, string> = {
                BUYER: 'bg-blue-500', VENDOR: 'bg-brand-500',
                SUPER_ADMIN: 'bg-red-500', SUB_ADMIN: 'bg-yellow-500',
              };
              return <Bar key={role} label={role} value={count} max={data?.maxRole || 1} color={COLORS[role] || 'bg-gray-400'} />;
            })}
            {Object.keys(data?.roleMap || {}).length === 0 && <p className="text-sm text-gray-400 text-center py-4">No data</p>}
          </div>
        </div>

        {/* Inquiry breakdown */}
        <div className="card p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Inquiry Status Breakdown</h3>
          <div className="space-y-4">
            {[
              { status: 'PENDING', color: 'bg-yellow-400', label: 'Awaiting Response' },
              { status: 'RESPONDED', color: 'bg-green-500', label: 'Responded' },
              { status: 'CLOSED', color: 'bg-gray-400', label: 'Closed' },
            ].map(({ status, color, label }) => {
              const count = data?.inqByStatus?.[status] || 0;
              const total = data?.totalInquiries || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status}>
                  <div className="flex justify-between mb-1.5 text-sm">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2.5">
                    <div className={`${color} h-2.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {data?.totalInquiries === 0 && <p className="text-sm text-gray-400 text-center py-4">No inquiries yet</p>}
          </div>
        </div>

        {/* Subscription plans */}
        <div className="card p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Subscription Plans</h3>
          <div className="space-y-3">
            {Object.entries(data?.planBreakdown || {}).map(([plan, count]: any) => {
              const COLORS: Record<string, string> = {
                FREE: 'bg-gray-400', BASIC: 'bg-blue-500', PREMIUM: 'bg-brand-500', ENTERPRISE: 'bg-purple-500',
              };
              return <Bar key={plan} label={plan} value={count} max={data?.maxPlan || 1} color={COLORS[plan] || 'bg-gray-400'} />;
            })}
            {Object.keys(data?.planBreakdown || {}).length === 0 && <p className="text-sm text-gray-400 text-center py-4">No subscriptions yet</p>}
          </div>
        </div>

        {/* Platform health */}
        <div className="card p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Platform Health</h3>
          <div className="space-y-4">
            {[
              {
                label: 'Vendor Approval Rate',
                value: s.totalVendors > 0 ? Math.round(((s.totalVendors - (s.pendingVendors || 0)) / s.totalVendors) * 100) : 0,
                color: 'text-green-600', bg: 'bg-green-50',
              },
              {
                label: 'Inquiry Response Rate',
                value: data?.totalInquiries > 0
                  ? Math.round(((data?.inqByStatus?.RESPONDED || 0) / data?.totalInquiries) * 100) : 0,
                color: 'text-blue-600', bg: 'bg-blue-50',
              },
              {
                label: 'Subscription Conversion',
                value: s.totalVendors > 0
                  ? Math.round((s.activeSubscriptions / s.totalVendors) * 100) : 0,
                color: 'text-brand-600', bg: 'bg-brand-50',
              },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm text-gray-700">{label}</span>
                <div className={`${bg} ${color} text-sm font-bold px-3 py-1 rounded-lg`}>{value}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
