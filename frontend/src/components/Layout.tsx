import React from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react'
import { LiveClock } from '@/components/LiveClock'
import { confirmSignOut, signedOutNotice } from '@/lib/session'
import { OfflineBanner } from '@/components/OfflineBanner'

export const Layout = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const canManage = profile?.role === 'Admin' || profile?.role === 'Outlet Manager'

  const handleSignOut = async () => {
    const confirmed = await confirmSignOut(profile?.username)
    if (!confirmed) return
    signOut()
    await signedOutNotice()
    navigate('/login')
  }

  return (
    <div className="min-h-dvh bg-[#f8fafc] flex flex-col">
      <OfflineBanner />
      <header className="bg-white border-b border-slate-200 h-14 sm:h-16 flex items-center justify-between gap-2 px-3 sm:px-6 shadow-sm shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-white font-bold text-xl shrink-0">
            E
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-base sm:text-lg tracking-tight text-slate-800 leading-tight truncate">Essentials POS</h1>
            <LiveClock className="text-[10px] sm:text-xs font-mono text-slate-400" />
          </div>
          {canManage && (
             <Link to="/admin" className="ml-1 sm:ml-4 text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 shrink-0">
               <LayoutDashboard className="w-4 h-4" />
               <span className="hidden sm:inline">Dashboard</span>
             </Link>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 min-w-0">
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline truncate max-w-[12rem]">{profile?.username} ({profile?.role})</span>
            <span className="md:hidden truncate max-w-[8rem]">{profile?.username}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="border-slate-200 text-slate-600 px-2 sm:px-3">
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
