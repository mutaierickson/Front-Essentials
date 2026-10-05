import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardData, emptyDashboard } from '@/types/dashboard'
import { loadDashboard } from '@/models/dashboardModel'

export function useAdminDashboardController() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'Admin'
  const [data, setData] = useState<DashboardData>(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const load = async () => {
    try {
      setData(await loadDashboard(profile?.id))
      setUpdatedAt(new Date())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, 45_000)
    return () => clearInterval(timer)
  }, [profile?.id])

  const paymentTotal = useMemo(
    () => data.payments.reduce((sum, row) => sum + Number(row.total_amount || 0), 0),
    [data.payments]
  )

  return { profile, isAdmin, data, loading, updatedAt, paymentTotal, refresh: load }
}
