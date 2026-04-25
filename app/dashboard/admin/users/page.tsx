'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toaster';
import { formatDate } from '@/utils/helpers';
import { useAuthStore } from '@/store/authStore';

const ROLE_COLORS: Record<string, string> = {
  BUYER: 'bg-blue-100 text-blue-700',
  VENDOR: 'bg-brand-100 text-brand-700',
  SUB_ADMIN: 'bg-yellow-100 text-yellow-700',
  SUPER_ADMIN: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
  const { request } = useApi();
  const { showToast } = useToast();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    const res = await request(`/api/admin/users?${params}`);
    if (res) { const list = res.users || (Array.isArray(res) ? res : []); const meta = res.meta || {}; setUsers(list); setTotal(meta.total || list.length || 0); }
    setLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    setActionUserId(userId);
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const res = await request(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      showToast(`User ${newStatus.toLowerCase()}`, 'success');
    }
    setActionUserId(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    setActionUserId(userId);
    const res = await request(`/api/admin/users/${userId}`, { method: 'DELETE' });
    if (res !== null) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User deleted', 'success');
    }
    setActionUserId(null);
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-4 flex-wrap">
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input flex-1 min-w-48" placeholder="Search by name or email..." />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="input w-40">
            <option value="">All Roles</option>
            <option value="BUYER">Buyer</option>
            <option value="VENDOR">Vendor</option>
            <option value="SUB_ADMIN">Sub Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email Verified</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : u.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.emailVerified
                        ? <span className="text-green-500">✓</span>
                        : <span className="text-gray-300">✗</span>
                      }
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      {u.id !== currentUser?.id && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            disabled={actionUserId === u.id}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}>
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                          {currentUser?.role === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleDelete(u.id)}
                              disabled={actionUserId === u.id}
                              className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50">Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
