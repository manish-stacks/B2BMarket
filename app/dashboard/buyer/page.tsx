'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MessageSquare, ShoppingBag, Heart, Bell, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { formatDate } from '@/utils/helpers';

export default function BuyerDashboard() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ inquiries: 0, orders: 0, wishlist: 0, unread: 0 });
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('/api/inquiries?limit=5', { headers }),
      axios.get('/api/wishlist', { headers }),
      axios.get('/api/notifications', { headers }),
    ]).then(([inq, wish, notif]) => {
      setRecentInquiries(inq.data.data.inquiries?.slice(0, 5) || []);
      setStats({
        inquiries: inq.data.data.meta?.total || 0,
        orders: 0,
        wishlist: wish.data.data?.length || 0,
        unread: notif.data.data?.unreadCount || 0,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const statCards = [
    { label: 'Total Inquiries', value: stats.inquiries, icon: MessageSquare, color: 'blue', href: '/dashboard/buyer/inquiries' },
    { label: 'My Orders', value: stats.orders, icon: ShoppingBag, color: 'green', href: '/dashboard/buyer/orders' },
    { label: 'Wishlist Items', value: stats.wishlist, icon: Heart, color: 'red', href: '/dashboard/buyer/wishlist' },
    { label: 'Unread Notifications', value: stats.unread, icon: Bell, color: 'orange', href: '/dashboard/buyer/messages' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-display">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your account.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} href={href} className="card p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 text-${color}-600`} />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
              <Link href="/dashboard/buyer/inquiries" className="text-sm text-brand-600 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentInquiries.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No inquiries yet. <Link href="/marketplace" className="text-brand-600">Browse products</Link></div>
              ) : (
                recentInquiries.map((inq) => (
                  <div key={inq.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{inq.subject}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{inq.vendor?.companyName}</p>
                      </div>
                      <span className={`badge flex-shrink-0 ${inq.status === 'RESPONDED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{inq.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(inq.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Browse Products', href: '/marketplace', icon: ShoppingBag },
                { label: 'Send Inquiry', href: '/marketplace', icon: MessageSquare },
                { label: 'View Wishlist', href: '/dashboard/buyer/wishlist', icon: Heart },
                { label: 'View Messages', href: '/dashboard/buyer/messages', icon: Bell },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={label} href={href} className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 text-sm text-gray-600 hover:text-brand-700 transition-all">
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
