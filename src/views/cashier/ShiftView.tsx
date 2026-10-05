import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatKsh, formatTimestamp, greetingFor } from '@/lib/utils'
import { formatVariance } from '@/lib/closeDay'
import { makeReceiptCode } from '@/lib/receiptCode'
import { paymentLabel, HeldSale } from '@/lib/pos'
import { DashboardData, DashboardOrder } from '@/types/dashboard'
import { AlertTriangle, FileSearch, Lock, RefreshCw, ShoppingCart } from 'lucide-react'

type Props = {
  username?: string
  stats: DashboardData
  heldSales: HeldSale[]
  canClose: boolean
  onRefresh: () => void
  onLookup: () => void
  onOpenRegister: () => void
  onCloseDay: () => void
  onRecall: (sale: HeldSale) => void
  onDiscard: (sale: HeldSale) => void
  onReprint: (order: DashboardOrder) => void
  onReturn?: (order: DashboardOrder) => void
  onVoid?: (order: DashboardOrder) => void
}

export function ShiftView({
  username, stats, heldSales, canClose, onRefresh, onLookup, onOpenRegister,
  onCloseDay, onRecall, onDiscard,   onReprint, onReturn, onVoid
}: Props) {
  const openCount = Number(stats.open_shift?.transactions || 0)

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{greetingFor()}, {username}</p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Cashier Dashboard</h2>
          <p className="text-sm text-slate-500">Your sales, receipts, parked carts, and stock to watch.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-slate-200" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" className="border-slate-200" onClick={onLookup}>
            <FileSearch className="w-4 h-4 mr-2" /> Find receipt
          </Button>
          <Button className="bg-slate-800 text-white hover:bg-slate-700" onClick={onOpenRegister}>
            <ShoppingCart className="w-4 h-4 mr-2" /> Open register
          </Button>
          <Button className="bg-emerald-700 text-white hover:bg-emerald-800" onClick={onCloseDay} disabled={!canClose}>
            <Lock className="w-4 h-4 mr-2" /> Close day
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Shift sales', formatKsh(stats.shift.sales)],
          ['My receipts', String(stats.shift.transactions)],
          ['Average ticket', formatKsh(stats.shift.avg_ticket)],
          ['Items sold', String(stats.shift.items_sold)]
        ].map(([label, value]) => (
          <Card key={label} className="border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(openCount > 0 || stats.last_close) && (
        <Card className={`border-slate-200 ${openCount > 0 ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {openCount > 0
                  ? `${openCount} open receipt${openCount === 1 ? '' : 's'} · ${formatKsh(stats.open_shift.sales)}`
                  : 'Today’s sales are closed'}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {stats.last_close
                  ? `Last closed ${formatTimestamp(stats.last_close.closed_at)} · ${stats.last_close.sales_count} receipts · ${formatKsh(stats.last_close.sales_total)}${stats.last_close.counted_cash == null ? '' : ` · ${formatVariance(stats.last_close.variance)}`}`
                  : 'Close the day to send this shift to the manager dashboard.'}
              </p>
            </div>
            <Button
              className="bg-emerald-700 text-white hover:bg-emerald-800 w-full sm:w-auto"
              onClick={onCloseDay}
              disabled={!canClose || openCount === 0}
            >
              <Lock className="w-4 h-4 mr-2" /> Close day
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-slate-800">My payments today</h3>
            {(stats.shift_payments || []).length === 0 ? (
              <p className="text-sm text-slate-500">No payments on this shift yet.</p>
            ) : stats.shift_payments.map(row => (
              <div key={row.method} className="flex justify-between text-sm">
                <span>{paymentLabel(row.method)}</span>
                <span className="font-semibold">{formatKsh(row.total_amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-slate-800">Held sales</h3>
            {heldSales.length === 0 ? (
              <p className="text-sm text-slate-500">No parked carts. Use Hold on the register.</p>
            ) : heldSales.map(sale => (
              <div key={sale.id} className="flex items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-medium">{sale.customerName || 'Walk-in'}</p>
                  <p className="text-xs text-slate-500">{sale.items.length} items · {formatTimestamp(sale.at)}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => onRecall(sale)}>Recall</Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onDiscard(sale)}>Discard</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Watch stock
            </h3>
            {stats.low_stock.length === 0 ? (
              <p className="text-sm text-slate-500">No low-stock items.</p>
            ) : stats.low_stock.slice(0, 6).map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name}{item.size ? ` · ${item.size}` : ''}</span>
                <span className={item.stock_quantity <= 0 ? 'text-red-600 font-semibold' : 'text-amber-700'}>
                  {item.stock_quantity}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-slate-800">My recent receipts</h3>
          {(stats.my_orders || []).length === 0 ? (
            <p className="text-sm text-slate-500">No sales on this shift yet.</p>
          ) : stats.my_orders.map(order => (
            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="font-medium break-words">{order.receipt_code || makeReceiptCode(order.id)} · {order.customer_name || 'Walk-in'}</p>
                <p className="text-xs text-slate-500">
                  {formatTimestamp(order.created_at)} · {paymentLabel(order.method)}
                  {order.voided ? ' · Voided' : order.close_id ? ' · Closed' : ' · Open'}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="font-semibold">{formatKsh(order.total_amount)}</span>
                <Button size="sm" variant="outline" onClick={() => onReprint(order)}>Reprint</Button>
                {onReturn && !order.voided && (
                  <Button size="sm" variant="outline" onClick={() => onReturn(order)}>Return</Button>
                )}
                {onVoid && !order.voided && (
                  <Button size="sm" variant="outline" className="text-red-700" onClick={() => onVoid(order)}>Void</Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
