import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportReportPdf } from '@/lib/exportPdf'
import { ReportTable } from './ReportTable'

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

export function SalesOverview({
  period,
  onPeriod,
  salesData
}: {
  period: Period
  onPeriod: (period: Period) => void
  salesData: any[]
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map(p => (
            <Button key={p} variant={period === p ? 'default' : 'outline'} onClick={() => onPeriod(p)} className={`capitalize ${period === p ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>
              {p}
            </Button>
          ))}
        </div>
        <Button variant="outline" onClick={() => exportReportPdf(salesData, `${period.toUpperCase()} Sales Report`, `sales_${period}`)}>
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>
      <Card className="shadow-sm border-slate-200">
        <CardHeader><CardTitle className="capitalize">{period} Sales Trends</CardTitle></CardHeader>
        <CardContent className="p-0">
          <ReportTable
            rows={salesData}
            empty="No data available."
            columns={[
              { key: 'period', header: 'Period', render: row => <span className="font-medium">{row.period}</span> },
              { key: 'txns', header: 'Transactions', className: 'text-right', render: row => row.transaction_count },
              { key: 'sales', header: 'Total Sales', className: 'text-right font-bold', render: row => `Ksh ${Number(row.total_sales || 0).toFixed(2)}` },
              { key: 'vat', header: 'VAT 16%', className: 'text-right', render: row => `Ksh ${Number(row.total_vat || 0).toFixed(2)}` }
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function SalesPerformance({ categoryData, cashierData }: { categoryData: any[]; cashierData: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Category Performance</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => exportReportPdf(categoryData, 'Category Performance', 'category_performance')}><Download className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="p-0">
          <ReportTable
            rows={categoryData}
            empty="No data available."
            columns={[
              { key: 'cat', header: 'Category', render: row => <span className="font-medium">{row.category_name}</span> },
              { key: 'sold', header: 'Items Sold', className: 'text-right', render: row => row.items_sold },
              { key: 'rev', header: 'Revenue', className: 'text-right font-bold', render: row => `Ksh ${Number(row.total_revenue || 0).toFixed(2)}` }
            ]}
          />
        </CardContent>
      </Card>
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Cashier Performance</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => exportReportPdf(cashierData, 'Cashier Performance', 'cashier_performance')}><Download className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="p-0">
          <ReportTable
            rows={cashierData}
            empty="No data available."
            columns={[
              { key: 'name', header: 'Cashier', render: row => <span className="font-medium">{row.cashier_name}</span> },
              { key: 'txns', header: 'Txns', className: 'text-right', render: row => row.total_transactions },
              { key: 'rev', header: 'Revenue', className: 'text-right font-bold', render: row => `Ksh ${Number(row.total_revenue || 0).toFixed(2)}` }
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function SalesFinancials({ profitData, paymentData }: { profitData: any[]; paymentData: any[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {profitData.length > 0 && profitData[0] ? (
          <>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="pb-2"><CardTitle className="text-slate-500 text-sm">Total Revenue</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-slate-800">Ksh {Number(profitData[0].total_revenue || 0).toFixed(2)}</p></CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="pb-2"><CardTitle className="text-slate-500 text-sm">VAT 16% (inclusive)</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-slate-800">Ksh {Number(profitData[0].total_vat || 0).toFixed(2)}</p></CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="pb-2"><CardTitle className="text-slate-500 text-sm">Cost of Goods Sold (COGS)</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-red-600">Ksh {Number(profitData[0].total_cogs || 0).toFixed(2)}</p></CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-slate-800 text-white">
              <CardHeader className="pb-2"><CardTitle className="text-slate-300 text-sm">Gross Profit</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">Ksh {Number(profitData[0].gross_profit || 0).toFixed(2)}</p></CardContent>
            </Card>
          </>
        ) : (
          <div className="col-span-full text-center text-slate-500">No financial data.</div>
        )}
      </div>
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Payment Method Analysis (Today)</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => exportReportPdf(paymentData, 'Payment Method Analysis', 'payment_analysis')}><Download className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="p-0">
          <ReportTable
            rows={paymentData}
            empty="No payments today."
            columns={[
              { key: 'method', header: 'Method', render: row => <span className="font-medium">{row.method}</span> },
              { key: 'amt', header: 'Amount Received', className: 'text-right font-bold', render: row => `Ksh ${Number(row.total_amount || 0).toFixed(2)}` }
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
