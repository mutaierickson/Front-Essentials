import { useEffect, useRef, useState } from 'react'
import { cashierReport, categoryReport, paymentReport, Period, profitReport, salesReport } from '@/models/reportModel'

export const REPORT_TABS = [
  { id: 'overview', label: 'Sales Overview' },
  { id: 'performance', label: 'Performance Analytics' },
  { id: 'financials', label: 'Financials & Payments' }
] as const

export type ReportTab = typeof REPORT_TABS[number]['id']

export function useSalesReportController() {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview')
  const [period, setPeriod] = useState<Period>('daily')
  const [salesData, setSalesData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [cashierData, setCashierData] = useState<any[]>([])
  const [profitData, setProfitData] = useState<any[]>([])
  const [paymentData, setPaymentData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const overviewCache = useRef<Record<string, any[]>>({})

  const fetchOverview = async () => {
    const cached = overviewCache.current[period]
    if (cached) {
      setSalesData(cached)
      return
    }
    setLoading(true)
    try {
      const data = await salesReport(period)
      overviewCache.current[period] = data
      setSalesData(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const fetchPerformance = async () => {
    setLoading(true)
    try {
      const [cats, cashiers] = await Promise.all([categoryReport(), cashierReport()])
      setCategoryData(cats)
      setCashierData(cashiers)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const fetchFinancials = async () => {
    setLoading(true)
    try {
      const [profit, payments] = await Promise.all([profitReport(), paymentReport()])
      setProfitData(profit)
      setPaymentData(payments)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'overview') fetchOverview()
  }, [activeTab, period])

  useEffect(() => {
    if (activeTab === 'performance' && categoryData.length === 0) fetchPerformance()
    if (activeTab === 'financials' && profitData.length === 0) fetchFinancials()
  }, [activeTab])

  return {
    activeTab, setActiveTab, period, setPeriod, loading,
    salesData, categoryData, cashierData, profitData, paymentData
  }
}
