'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { formatDate } from '@/utils/helpers';
import Link from 'next/link';

const StatCard = ({ label, value, icon, color, href }: any) => (
  <Link href={href || '#'} className={`card hover:shadow-md transition-all border-l-4 ${color}`}>
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </Link>
);

export default function AdminDashboardPage() {
  const { request } = useApi();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('/api/admin/stats').then((res: any) => {
      setStats(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const s = stats?.stats || {};

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={s.totalUsers} icon="👥" color="border-blue-400" href="/dashboard/admin/users" />
        <StatCard label="Vendors" value={s.totalVendors} icon="🏢" color="border-brand-400" href="/dashboard/admin/vendors" />
        <StatCard label="Products" value={s.totalProducts} icon="📦" color="border-green-400" href="/dashboard/admin/products" />
        <StatCard label="Inquiries" value={s.totalInquiries} icon="📩" color="border-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role breakdown */}
        <div className="card p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Roles</h2>
          {stats?.roleBreakdown?.length ? (
            <div className="space-y-3">
              {stats.roleBreakdown.map(({ role, _count }: any) => {
                const count = _count?.role || 0;
                const total = s.totalUsers || 1;
                const pct = Math.round((count / total) * 100);
                const colors: Record<string, string> = {
                  BUYER: 'bg-blue-500', VENDOR: 'bg-brand-500',
                  SUPER_ADMIN: 'bg-red-500', SUB_ADMIN: 'bg-yellow-500',
                };
                return (
                  <div key={role}>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-600">{role}</span>
                      <span className="font-medium">{count} ({pct}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div className={`${colors[role] || 'bg-gray-400'} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No data</p>
          )}
        </div>

        {/* Pending vendors */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Approvals
              {s.pendingVendors > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{s.pendingVendors}</span>
              )}
            </h2>
            <Link href="/dashboard/admin/vendors" className="text-sm text-brand-600 hover:text-brand-700">View all →</Link>
          </div>
          {stats?.recentVendors?.length ? (
            <div className="space-y-3">
              {stats.recentVendors.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{v.companyName}</p>
                    <p className="text-xs text-gray-500">{v.user?.email}</p>
                  </div>
                  <Link href="/dashboard/admin/vendors" className="btn-primary text-xs py-1.5 px-3">Review</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No pending vendors 🎉</p>
          )}
        </div>

        {/* Recent users table */}
        <div className="card lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
            <Link href="/dashboard/admin/users" className="text-sm text-brand-600 hover:text-brand-700">View all →</Link>
          </div>
          {stats?.recentUsers?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((u: any) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-900">{u.name}</td>
                      <td className="py-2 px-3 text-gray-500">{u.email}</td>
                      <td className="py-2 px-3">
                        <span className={`badge text-xs ${u.role === 'VENDOR' ? 'bg-brand-100 text-brand-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                      </td>
                      <td className="py-2 px-3 text-gray-400">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No users yet</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
