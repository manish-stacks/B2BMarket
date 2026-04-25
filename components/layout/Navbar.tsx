'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Heart, ShoppingCart, User, Menu, X, ChevronDown, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
  };

  const dashboardPath = {
    SUPER_ADMIN: '/dashboard/admin', SUB_ADMIN: '/dashboard/admin',
    VENDOR: '/dashboard/vendor', BUYER: '/dashboard/buyer',
  }[user?.role || ''] || '/dashboard/buyer';

  return (
    <>
      {/* Top bar */}
      <div className="bg-navy-900 text-white text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>India's Trusted B2B Marketplace | 50 Lakh+ Products | 5 Lakh+ Verified Suppliers</span>
          <div className="flex gap-4">
            <Link href="/auth/register?role=VENDOR" className="hover:text-brand-400">Sell on B2B</Link>
            <span>|</span>
            <Link href="/help" className="hover:text-brand-400">Help Center</Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B2</span>
              </div>
              <span className="text-xl font-bold text-navy-900 font-display hidden sm:block">B2BMarket</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search products, suppliers, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 border-2 border-brand-500 border-r-0 rounded-l-lg focus:outline-none text-sm"
                />
                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-r-lg transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-lg hidden md:flex">
                    <Heart className="h-5 w-5 text-gray-600" />
                  </Link>
                  <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg hidden md:flex">
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{cartItems.length}</span>
                    )}
                  </Link>
                  <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg hidden md:flex">
                    <Bell className="h-5 w-5 text-gray-600" />
                  </Link>

                  {/* Profile dropdown */}
                  <div className="relative">
                    <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                        <span className="text-brand-700 font-semibold text-sm">{user?.name?.[0] || 'U'}</span>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500 hidden sm:block" />
                    </button>
                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                          <Link href={dashboardPath} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                            <LayoutDashboard className="h-4 w-4" /> Dashboard
                          </Link>
                          <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                            <Settings className="h-4 w-4" /> Settings
                          </Link>
                          <button onClick={() => { logout(); setProfileOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600 w-full">
                            <LogOut className="h-4 w-4" /> Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-brand-600 px-3 py-2">Login</Link>
                  <Link href="/auth/register" className="btn-primary text-sm py-2 px-4 rounded-lg">Register Free</Link>
                </div>
              )}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 hover:bg-gray-100 rounded-lg md:hidden">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Category bar */}
        <div className="border-t border-gray-100 bg-white hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-6 h-10 text-sm">
              {['Industrial Machinery', 'Electronics', 'Chemicals', 'Construction', 'Textiles', 'Agriculture', 'Automobiles', 'Food & Beverages'].map((cat) => (
                <Link key={cat} href={`/marketplace?category=${cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="text-gray-600 hover:text-brand-600 whitespace-nowrap">
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
