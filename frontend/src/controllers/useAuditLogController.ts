import { useEffect, useState } from 'react'
import { AuditLog, listAuditLogs } from '@/models/auditModel'

export function useAuditLogController() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        setLogs(await listAuditLogs())
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchLogs()
  }, [])

  return { logs, loading }
}
