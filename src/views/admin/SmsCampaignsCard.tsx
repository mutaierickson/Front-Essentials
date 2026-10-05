import { formatTimestamp } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SmsCampaign } from '@/models/smsModel'

export function SmsCampaignsCard({ campaigns }: { campaigns: SmsCampaign[] }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Recent campaigns</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">No SMS sent yet.</TableCell></TableRow>
            ) : campaigns.map(row => (
              <TableRow key={row.id}>
                <TableCell>{formatTimestamp(row.created_at)}</TableCell>
                <TableCell>
                  <p className="font-medium text-slate-800">{row.title}</p>
                  <p className="text-xs text-slate-500 truncate max-w-md">{row.message}</p>
                </TableCell>
                <TableCell className="text-right">{row.sent_count}/{row.recipient_count}</TableCell>
                <TableCell className="capitalize">{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
