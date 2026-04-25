'use client';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { CreditCard, Search, TrendingUp } from 'lucide-react';

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-600',
  BASIC: 'bg-blue-100 text-blue-700',
  PREMIUM: 'bg-brand-100 text-brand-700',
  ENTERPRISE: 'bg-purple-100 text-purple-700',
};
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export default function AdminSubscriptionsPage() {
  const { request } = useApi();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, revenue: 0, byPlan: {} as Record<string, number> });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await request('/api/admin/subscriptions');
    const list = res?.subscriptions || (Array.isArray(res) ? res : []);
    setSubs(list);

    // Compute stats
    const active = list.filter((s: any) => s.status === 'ACTIVE').length;
    const revenue = list.filter((s: any) => s.status === 'ACTIVE').reduce((sum: number, s: any) => sum + Number(s.price || 0), 0);
    const byPlan: Record<string, number> = {};
    list.forEach((s: any) => { byPlan[s.plan] = (byPlan[s.plan] || 0) + 1; });
    setStats({ total: list.length, active, revenue, byPlan });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = subs.filter(s => {
    const matchPlan = !planFilter || s.plan === planFilter;
    const matchSearch = !search ||
      s.vendor?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      s.vendor?.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchPlan && matchSearch;
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-brand-600" /> Subscriptions
        </h1>
        <p className="text-gray-500 text-sm">Manage vendor subscription plans</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Subscriptions', value: stats.total, icon: '📋' },
          { label: 'Active', value: stats.active, icon: '✅' },
          { label: 'Monthly Revenue', value: formatCurrency(stats.revenue), icon: '💰' },
          { label: 'Premium Plans', value: stats.byPlan['PREMIUM'] || 0, icon: '⭐' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <span className="text-2xl">{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="card mb-6 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Plan Distribution</h3>
        <div className="flex gap-4 flex-wrap">
          {Object.entries(PLAN_COLORS).map(([plan, cls]) => (
            <div key={plan} className="flex items-center gap-2">
              <span className={`badge text-xs ${cls}`}>{plan}</span>
              <span className="text-sm font-bold text-gray-900">{stats.byPlan[plan] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Search vendor..." />
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="input w-40">
          <option value="">All Plans</option>
          {Object.keys(PLAN_COLORS).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-20 text-gray-400">No subscriptions found</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Started</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((sub: any) => {
                const isExpired = sub.endDate && new Date(sub.endDate) < new Date();
                const status = isExpired ? 'EXPIRED' : sub.status;
                return (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{sub.vendor?.companyName}</p>
                      <p className="text-xs text-gray-400">{sub.vendor?.user?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${PLAN_COLORS[sub.plan] || 'bg-gray-100 text-gray-600'}`}>{sub.plan}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{formatCurrency(Number(sub.price || 0))}</td>
                    <td className="py-3 px-4 text-xs text-gray-400">{formatDate(sub.startDate || sub.createdAt)}</td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {sub.endDate ? (
                        <span className={isExpired ? 'text-red-500 font-medium' : ''}>
                          {formatDate(sub.endDate)}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
