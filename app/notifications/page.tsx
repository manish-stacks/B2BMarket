'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useApi } from '@/hooks/useApi';
import { formatDate } from '@/utils/helpers';
import Link from 'next/link';

export default function NotificationsPage() {
  const { request } = useApi();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('/api/notifications').then((res: any) => {
      setNotifications(res?.notifications || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await request('/api/notifications', { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllRead} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : notifications.length === 0 ? (
          <div className="card text-center py-20">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div key={n.id} className={`card flex items-start gap-4 ${!n.isRead ? 'border-l-4 border-l-brand-500' : ''}`}>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${!n.isRead ? 'bg-brand-500' : 'bg-gray-200'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  {n.message && <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
