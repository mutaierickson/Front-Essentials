import { apiGet } from '@/lib/api'
import { DashboardData } from '@/types/dashboard'

export const loadDashboard = (userId?: number): Promise<DashboardData> =>
  apiGet(`/dashboard${userId ? `?user_id=${userId}` : ''}`)
