import { apiGet } from '@/lib/api'

export type AuditLog = {
  id: number
  user_id: number | null
  username?: string | null
  action: string
  details: string
  created_at: string
}

export const listAuditLogs = (): Promise<AuditLog[]> => apiGet('/audit-logs')
