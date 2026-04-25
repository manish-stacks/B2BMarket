'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/utils/helpers';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function BuyerOrdersPage() {
  const { request } = useApi();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('/api/orders').then((res: any) => {
      setOrders(Array.isArray(res) ? res : res?.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 text-sm">Track and manage your orders</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500 mb-2 font-medium">No orders yet</p>
          <p className="text-gray-400 text-sm mb-6">Start by browsing products and sending inquiries</p>
          <Link href="/marketplace" className="btn-primary inline-block">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900">Order #{order.orderNumber || order.id.slice(-8).toUpperCase()}</p>
                    <span className={`badge text-xs ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <p className="font-bold text-brand-600 text-lg">{formatCurrency(order.totalAmount)}</p>
              </div>
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 py-3 border-t border-gray-50">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0]
                      ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.product?.title || item.productName}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
