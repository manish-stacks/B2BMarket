'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useAppStore } from '@/store/app.store'
import {
  LayoutDashboard, Users, Store, Package, Tags, FileText,
  CreditCard, BarChart2, LogOut, Menu, X, Shield, ChevronRight
} from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard',    roles: ['SUPER_ADMIN', 'SUB_ADMIN'] },
  { href: '/admin/users',        icon: Users,           label: 'Users',        roles: ['SUPER_ADMIN', 'SUB_ADMIN'] },
  { href: '/admin/vendors',      icon: Store,           label: 'Vendors',      roles: ['SUPER_ADMIN', 'SUB_ADMIN'] },
  { href: '/admin/products',     icon: Package,         label: 'Products',     roles: ['SUPER_ADMIN', 'SUB_ADMIN'] },
  { href: '/admin/categories',   icon: Tags,            label: 'Categories',   roles: ['SUPER_ADMIN', 'SUB_ADMIN'] },
  { href: '/admin/cms',          icon: FileText,        label: 'CMS Pages',    roles: ['SUPER_ADMIN'] },
  { href: '/admin/subscriptions',icon: CreditCard,      label: 'Subscriptions',roles: ['SUPER_ADMIN'] },
  { href: '/admin/reports',      icon: BarChart2,       label: 'Reports',      roles: ['SUPER_ADMIN', 'SUB_ADMIN'] },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  const role = user?.role || ''
  const visibleNav = NAV.filter(n => n.roles.includes(role))

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 shadow-lg transform transition-transform duration-200
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-primary-400" />
            <div>
              <p className="text-white font-semibold text-sm">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{role.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {visibleNav.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${active
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                `}
              >
                <Icon size={18} />
                <span>{label}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/30 w-full transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
            <Menu size={22} />
          </button>
          <h1 className="font-semibold text-gray-800">Admin Panel</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
