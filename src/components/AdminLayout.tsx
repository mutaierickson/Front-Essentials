import React, { useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Shirt, Tags, Receipt, ShoppingCart, Shield, Users, Menu, X, Megaphone, PackagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { confirmSignOut, signedOutNotice } from '@/lib/session'
import { OfflineBanner } from '@/components/OfflineBanner'

export const AdminLayout = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const panelTitle = profile?.role === 'Outlet Manager' ? 'Manager Panel' : 'Admin Panel'

  const handleSignOut = async () => {
    const confirmed = await confirmSignOut(profile?.username)
    if (!confirmed) return
    signOut()
    await signedOutNotice()
    navigate('/login')
  }

  const navItems = useMemo(() => [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'POS Terminal', path: '/cashier', icon: ShoppingCart },
    { label: 'Products', path: '/admin/products', icon: Shirt },
    { label: 'Receive stock', path: '/admin/stock', icon: PackagePlus },
    { label: 'Categories', path: '/admin/categories', icon: Tags },
    { label: 'Sales Reports', path: '/admin/sales', icon: Receipt },
    { label: 'Bulk SMS', path: '/admin/sms', icon: Megaphone },
    ...(profile?.role === 'Admin'
      ? [
          { label: 'User Management', path: '/admin/users', icon: Users },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: Shield },
        ]
      : []),
  ], [profile?.role])

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-dvh bg-[#f8fafc] flex flex-col">
      <OfflineBanner />
      <div className="flex flex-1 min-h-0">
      {navOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={cn(
          "bg-white border-r border-slate-200 flex flex-col shadow-sm z-50",
          "fixed inset-y-0 left-0 w-72 max-w-[85vw] transition-transform duration-200",
          navOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:w-64 md:h-dvh md:sticky md:top-0"
        )}
      >
        <div className="py-6 md:py-8 flex flex-col items-center px-4 border-b border-slate-200 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 md:hidden"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </Button>
          <img src="/logo.png" alt="Essentials by ED" className="w-36 md:w-48 h-auto object-contain mb-3 md:mb-4" />
          <h1 className="font-semibold text-lg tracking-tight text-slate-800">
            {panelTitle}
          </h1>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <span className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.path ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200 mt-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-slate-800 truncate">{profile?.username}</p>
            <p className="text-xs text-slate-500">{profile?.role}</p>
          </div>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-0" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 h-14 flex items-center justify-between px-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-slate-800 truncate">{panelTitle}</span>
          <span className="text-xs text-slate-500 truncate max-w-[30%]">{profile?.username}</span>
        </div>
        <main className="flex-1 overflow-auto bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
      </div>
    </div>
  )
}
