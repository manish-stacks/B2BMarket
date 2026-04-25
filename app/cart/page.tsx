'use client';
import Navbar from '@/components/layout/Navbar';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/utils/helpers';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="card text-center py-20">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href="/marketplace" className="btn-primary inline-block">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="card flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-brand-600 font-bold">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold">−</button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
                </div>
              ))}
            </div>
            <div className="card h-fit">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span className="font-medium">{formatCurrency(total())}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-brand-600">{formatCurrency(total())}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 mb-4">* B2B orders are processed via inquiry. Use "Send Inquiry" on product pages.</p>
              <Link href="/marketplace" className="btn-secondary w-full text-center block">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
