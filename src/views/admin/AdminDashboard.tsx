import React from 'react'
import { Link } from 'react-router-dom'
import { formatKsh, greetingFor } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Banknote, ReceiptText, ShoppingCart, TrendingUp, RefreshCw } from 'lucide-react'
import { useAdminDashboardController } from '@/controllers/useAdminDashboardController'
import { ClosedSalesPanels, ReturnsToday, VoidsToday, RecentAndStock, MixAndStaff, DashboardShortcuts } from './DashboardPanels'

export default function AdminDashboard() {
  const { profile, isAdmin, data, loading, updatedAt, paymentTotal, refresh: load } = useAdminDashboardController()

  const kpis = [
    { label: "Today's sales", value: formatKsh(data.today.sales), icon: Banknote, hint: `${data.today.transactions} receipts · VAT ${formatKsh(data.today.vat || 0)}` },
    { label: isAdmin ? "Today's profit" : 'Avg. ticket', value: formatKsh(isAdmin ? data.today.profit : data.today.avg_ticket), icon: TrendingUp, hint: `${data.today.items_sold} items sold` },
    { label: 'Transactions', value: String(data.today.transactions), icon: ReceiptText, hint: formatKsh(data.today.avg_ticket) + ' average' },
    { label: 'Stock alerts', value: String(data.today.low_stock + data.today.out_of_stock), icon: AlertTriangle, hint: `${data.today.out_of_stock} out of stock` }
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{greetingFor()}, {profile?.username}</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
            {isAdmin ? 'Admin Dashboard' : 'Manager Dashboard'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isAdmin
              ? 'Store-wide sales, profit, inventory risk, and staff activity for today.'
              : 'Floor performance, closed cashier sales, and stock that needs attention.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {updatedAt && <span className="text-xs text-slate-400">Updated {updatedAt.toLocaleTimeString()}</span>}
          <Button variant="outline" onClick={load} className="border-slate-200 text-slate-700">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Link to="/cashier">
            <Button className="bg-slate-800 text-white hover:bg-slate-700">
              <ShoppingCart className="w-4 h-4 mr-2" /> Open POS
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{kpi.label}</CardTitle>
              <kpi.icon className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{loading ? '—' : kpi.value}</div>
              <p className="text-xs text-slate-500 mt-1">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ClosedSalesPanels data={data} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ReturnsToday data={data} />
        <VoidsToday data={data} />
      </div>
      <RecentAndStock data={data} />
      <MixAndStaff data={data} isAdmin={isAdmin} paymentTotal={paymentTotal} />
      <DashboardShortcuts isAdmin={isAdmin} />
    </div>
  )
}
