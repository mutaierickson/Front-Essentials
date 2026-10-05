import { Link } from 'react-router-dom'
import { formatKsh, formatTimestamp } from '@/lib/utils'
import { formatVariance, varianceClass } from '@/lib/closeDay'
import { DashboardData } from '@/types/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClipboardCheck, ReceiptText, Shirt, Tags, Users, Megaphone, Undo2 } from 'lucide-react'

export function ReturnsToday({ data }: { data: DashboardData }) {
  const returns = data.returns || { count: 0, refunds: 0, extras: 0, recent: [] }
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Undo2 className="w-5 h-5 text-slate-400" />
          Returns and exchanges today
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">{returns.count} processed</span>
          <span className="font-semibold">{returns.refunds ? `${formatKsh(returns.refunds)} refunded` : 'No refunds'}</span>
        </div>
        {returns.extras > 0 && (
          <p className="text-xs text-slate-500">Collected {formatKsh(returns.extras)} on exchanges.</p>
        )}
        {returns.recent.length === 0 ? (
          <p className="text-sm text-slate-500">No returns yet today.</p>
        ) : returns.recent.slice(0, 6).map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-slate-800 truncate">
                {row.return_code || row.type} · {row.receipt_code || 'Receipt'}
              </p>
              <p className="text-xs text-slate-500">
                {row.username || 'Cashier'} · {formatTimestamp(row.created_at)}
              </p>
            </div>
            <span className="shrink-0 font-semibold">
              {Number(row.refund_amount) > 0 ? `-${formatKsh(row.refund_amount)}` : Number(row.extra_amount) > 0 ? `+${formatKsh(row.extra_amount)}` : 'Even'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function VoidsToday({ data }: { data: DashboardData }) {
  const voids = data.voids || { count: 0, total: 0, recent: [] }
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Voids today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">{voids.count} voided</span>
          <span className="font-semibold">{voids.total ? formatKsh(voids.total) : 'None'}</span>
        </div>
        {voids.recent.length === 0 ? (
          <p className="text-sm text-slate-500">No voids yet today.</p>
        ) : voids.recent.slice(0, 6).map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-slate-800 truncate">{row.receipt_code || 'Receipt'} · {row.username || 'Staff'}</p>
              <p className="text-xs text-slate-500">{row.reason || 'No reason'} · {formatTimestamp(row.created_at)}</p>
            </div>
            <span className="shrink-0 font-semibold">{formatKsh(row.total_amount)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ClosedSalesPanels({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-slate-400" />
            Closed sales today
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(data.day_closes || []).length === 0 ? (
            <p className="text-sm text-slate-500 px-6 pb-6">No cashier has closed their day yet.</p>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Closed at</TableHead>
                  <TableHead className="text-right">Receipts</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Counted</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.day_closes.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.cashier_name}</TableCell>
                    <TableCell>{formatTimestamp(row.closed_at)}</TableCell>
                    <TableCell className="text-right">{row.sales_count}</TableCell>
                    <TableCell className="text-right font-semibold">{formatKsh(row.sales_total)}</TableCell>
                    <TableCell className="text-right">
                      {row.counted_cash == null ? '—' : formatKsh(row.counted_cash)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${varianceClass(row.counted_cash == null ? null : row.variance)}`}>
                      {row.counted_cash == null ? '—' : formatVariance(row.variance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Closed receipts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data.closed_orders || []).length === 0 ? (
            <p className="text-sm text-slate-500">Closed receipts will appear here after a cashier closes the day.</p>
          ) : data.closed_orders.slice(0, 8).map((order) => (
            <div key={order.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {order.receipt_code || `#${order.id}`} · {order.username || 'Cashier'}
                </p>
                <p className="text-xs text-slate-500">
                  {order.customer_name || 'Walk-in'} · {formatTimestamp(order.closed_at || order.created_at)}
                </p>
              </div>
              <span className="text-sm font-semibold shrink-0">{formatKsh(order.total_amount)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function RecentAndStock({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Recent sales</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent_orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">No sales yet today.</TableCell>
                </TableRow>
              ) : data.recent_orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.receipt_code || `#${order.id}`}
                    {order.voided ? ' · VOID' : ''}
                  </TableCell>
                  <TableCell>{order.username || '—'}</TableCell>
                  <TableCell>{order.customer_name || 'Walk-in'}</TableCell>
                  <TableCell className="text-right font-semibold">{formatKsh(order.total_amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Low stock</CardTitle>
          <Link to="/admin/products" className="text-xs text-slate-500 hover:text-slate-800">Inventory</Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.low_stock.length === 0 ? (
            <p className="text-sm text-slate-500">All products are above the minimum level.</p>
          ) : data.low_stock.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{[item.size, item.color].filter(Boolean).join(' · ') || 'Standard'}</p>
              </div>
              <span className={`text-sm font-bold ${item.stock_quantity <= 0 ? 'text-red-600' : 'text-amber-700'}`}>
                {item.stock_quantity}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function MixAndStaff({ data, isAdmin, paymentTotal }: { data: DashboardData; isAdmin: boolean; paymentTotal: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Payment mix today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments recorded yet.</p>
          ) : data.payments.map((row) => {
            const pct = paymentTotal ? (Number(row.total_amount) / paymentTotal) * 100 : 0
            return (
              <div key={row.method}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{row.method === 'Mobile' ? 'M-Pesa' : row.method}</span>
                  <span className="font-medium">{formatKsh(row.total_amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.max(pct, 4)}%` }} />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Top products today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.top_products.length === 0 ? (
            <p className="text-sm text-slate-500">No products sold yet.</p>
          ) : data.top_products.map((product) => (
            <div key={product.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">{product.name}</p>
                <p className="text-xs text-slate-500">{product.qty} sold</p>
              </div>
              <span className="text-sm font-semibold">{formatKsh(product.revenue)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>{isAdmin ? 'Staff today' : 'Cashiers today'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.cashiers.length === 0 ? (
            <p className="text-sm text-slate-500">No cashier activity yet.</p>
          ) : data.cashiers.map((row) => (
            <div key={row.cashier_name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">{row.cashier_name}</p>
                <p className="text-xs text-slate-500">
                  {row.total_transactions} sales
                  {Number(row.open_transactions) > 0
                    ? ` · ${row.open_transactions} still open`
                    : Number(row.closed_transactions) > 0
                      ? ' · day closed'
                      : ''}
                </p>
              </div>
              <span className="text-sm font-semibold">{formatKsh(row.total_revenue)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardShortcuts({ isAdmin }: { isAdmin: boolean }) {
  const links = [
    { to: '/admin/sms', icon: Megaphone, title: 'Bulk SMS', hint: 'Send offers to customers' },
    { to: '/admin/sales', icon: ReceiptText, title: 'Sales reports', hint: 'Daily, weekly, and profit views' },
    { to: '/admin/products', icon: Shirt, title: 'Inventory', hint: 'Buying price, stock, and profit %' },
    { to: '/admin/stock', icon: Shirt, title: 'Receive stock', hint: 'Add incoming units to a product' },
    isAdmin
      ? { to: '/admin/users', icon: Users, title: 'Users', hint: 'Cashiers, managers, and admins' }
      : { to: '/admin/categories', icon: Tags, title: 'Categories', hint: 'Product grouping' }
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {links.map((link) => (
        <Link key={link.title} to={link.to}>
          <Card className="border-slate-200 hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <link.icon className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-800">{link.title}</p>
                <p className="text-xs text-slate-500">{link.hint}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
