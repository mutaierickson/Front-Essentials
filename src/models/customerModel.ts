import { apiDelete, apiGet, apiPost } from '@/lib/api'

export type Customer = { id: number; name: string | null; phone: string; created_at: string }

export const listCustomers = (): Promise<Customer[]> => apiGet('/customers')

export const saveCustomer = (name: string, phone: string, userId?: number) =>
  apiPost('/customers', { name, phone, user_id: userId })

export const deleteCustomer = (id: number, userId?: number) =>
  apiDelete(`/customers/${id}?user_id=${userId || ''}`)
