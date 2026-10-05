import { apiGet } from '@/lib/api'

export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

export const salesReport = (period: Period): Promise<any[]> => apiGet(`/reports/sales?period=${period}`)

export const categoryReport = (): Promise<any[]> => apiGet('/reports/categories')

export const cashierReport = (): Promise<any[]> => apiGet('/reports/cashiers')

export const profitReport = (): Promise<any[]> => apiGet('/reports/profit')

export const paymentReport = (): Promise<any[]> => apiGet('/reports/payments')
