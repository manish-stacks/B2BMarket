'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useAppStore } from '@/store/app.store'
import {
  LayoutDashboard, Package, MessageSquare, Bell, CreditCard,
  User, BarChart2, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const NAV = [
  { href: '/vendor/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/vendor/products',      icon: Package,         label: 'Products' },
  { href: '/vendor/inquiries',     icon: MessageSquare,   label: 'Inquiries' },
  { href: '/messages',             icon: Bell,            label: 'Messages' },
  { href: '/vendor/subscription',  icon: CreditCard,      label: 'Subscription' },
  { href: '/vendor/profile',       icon: User,            label: 'Profile' },
  { href: '/vendor/analytics',     icon: BarChart2,       label: 'Analytics' },
]

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary-600">
          <div>
            <p className="text-white font-semibold text-sm truncate">{user?.vendor?.companyName || user?.name}</p>
            <p className="text-primary-200 text-xs">Vendor Account</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1 flex-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${active ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
            <Menu size={22} />
          </button>
          <h1 className="font-semibold text-gray-800">Vendor Panel</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
