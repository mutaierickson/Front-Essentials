import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { AdminLayout } from '@/components/AdminLayout'

// Views
import Login from '@/views/Login'
import CashierDashboard from '@/views/cashier/CashierDashboard'
import AdminDashboard from '@/views/admin/AdminDashboard'
import ProductManagement from '@/views/admin/ProductManagement'
import StockIntake from '@/views/admin/StockIntake'
import CategoryManagement from '@/views/admin/CategoryManagement'
import SalesManagement from '@/views/admin/SalesManagement'
import BulkSms from '@/views/admin/BulkSms'
import AuditLogs from '@/views/admin/AuditLogs'
import UserManagement from '@/views/admin/UserManagement'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Manager and Admin dashboard routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Outlet Manager']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/stock" element={<StockIntake />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/sales" element={<SalesManagement />} />
              <Route path="/admin/sms" element={<BulkSms />} />
            </Route>
          </Route>

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
          </Route>

          {/* Cashier & Manager Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Cashier', 'Outlet Manager', 'Admin']} />}>
            <Route element={<Layout />}>
              <Route path="/cashier" element={<CashierDashboard />} />
            </Route>
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
