import React from 'react'
import { formatTimestamp } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuditLogController } from '@/controllers/useAuditLogController'

export default function AuditLogs() {
  const { logs, loading } = useAuditLogController()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">System Audit Logs</h2>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading logs...</TableCell></TableRow>
              ) : logs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">No audit logs found.</TableCell></TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-slate-500">
                      {formatTimestamp(log.created_at)}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {log.username || 'System/Guest'}
                    </TableCell>
                    <TableCell>
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm max-w-xs truncate">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
