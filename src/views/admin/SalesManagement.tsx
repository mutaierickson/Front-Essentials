import React from 'react'
import { REPORT_TABS as TABS, useSalesReportController } from '@/controllers/useSalesReportController'
import { SalesOverview, SalesPerformance, SalesFinancials } from './SalesTabs'

export default function SalesManagement() {
  const {
    activeTab, setActiveTab, period, setPeriod, loading,
    salesData, categoryData, cashierData, profitData, paymentData
  } = useSalesReportController()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Reports & Analytics</h2>

      <div className="flex border-b border-slate-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id ? 'border-slate-800 text-slate-800 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading data...</div>
        ) : activeTab === 'overview' ? (
          <SalesOverview period={period} onPeriod={setPeriod} salesData={salesData} />
        ) : activeTab === 'performance' ? (
          <SalesPerformance categoryData={categoryData} cashierData={cashierData} />
        ) : (
          <SalesFinancials profitData={profitData} paymentData={paymentData} />
        )}
      </div>
    </div>
  )
}
