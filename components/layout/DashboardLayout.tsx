'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Package, MessageSquare, Bell, LogOut, Menu, X, Users, Settings, BarChart2, ShoppingBag, Heart, ChevronRight, Shield, CreditCard } from 'lucide-react';

const navItems = {
  BUYER: [
    { href: '/dashboard/buyer', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/buyer/inquiries', label: 'My Inquiries', icon: MessageSquare },
    { href: '/dashboard/buyer/orders', label: 'My Orders', icon: ShoppingBag },
    { href: '/dashboard/buyer/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/dashboard/buyer/messages', label: 'Messages', icon: Bell },
    { href: '/dashboard/buyer/settings', label: 'Settings', icon: Settings },
  ],
  VENDOR: [
    { href: '/dashboard/vendor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/vendor/products', label: 'Products', icon: Package },
    { href: '/dashboard/vendor/inquiries', label: 'Inquiries', icon: MessageSquare },
    { href: '/dashboard/vendor/messages', label: 'Messages', icon: Bell },
    { href: '/dashboard/vendor/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/dashboard/vendor/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/dashboard/vendor/profile', label: 'Company Profile', icon: Shield },
    { href: '/dashboard/vendor/settings', label: 'Settings', icon: Settings },
  ],
  SUPER_ADMIN: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard/admin/vendors', label: 'Vendors', icon: Shield },
    { href: '/dashboard/admin/products', label: 'Products', icon: Package },
    { href: '/dashboard/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
    { href: '/dashboard/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ],
  SUB_ADMIN: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard/admin/vendors', label: 'Vendors', icon: Shield },
    { href: '/dashboard/admin/products', label: 'Products', icon: Package },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, isAuthenticated, logout, updateUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    // Refresh user data (picks up vendor.id etc)
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.data) updateUser(d.data); })
        .catch(() => {});
    }
  }, [isAuthenticated, token]);

  if (!user) return null;

  const items = navItems[user.role as keyof typeof navItems] || navItems.BUYER;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B2</span>
          </div>
          <span className="font-bold text-gray-900 font-display">B2BMarket</span>
        </Link>
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
            <span className="text-brand-700 font-bold">{user.name?.[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              <Icon className={`h-4.5 w-4.5 ${active ? 'text-brand-600' : 'text-gray-400'}`} style={{ width: '18px', height: '18px' }} />
              {label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-brand-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button onClick={() => { logout(); router.push('/'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full transition-all">
          <LogOut className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-gray-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white z-50 lg:hidden flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-gray-900 text-sm">
            {items.find((i) => i.href === pathname)?.label || 'Dashboard'}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/marketplace" className="text-sm text-gray-500 hover:text-brand-600 hidden sm:block">← Marketplace</Link>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
