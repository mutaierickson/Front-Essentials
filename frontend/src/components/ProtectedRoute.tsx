import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

type ProtectedRouteProps = {
  allowedRoles?: ('Admin' | 'Outlet Manager' | 'Cashier' | 'Manager')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="w-8 h-8 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={profile.role === 'Cashier' ? '/cashier' : '/admin'} replace />
  }

  return <Outlet />
}
