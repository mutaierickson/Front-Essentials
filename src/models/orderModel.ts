import { apiGet, apiPost, flushOfflineOrders } from '@/lib/api'

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile'

export type OrderLineInput = {
  product_id: number
  quantity: number
  unit_price: number
  unit_cost: number
  subtotal: number
}

export type NewOrder = {
  user_id: number
  customer_name: string
  customer_phone: string | null
  items: OrderLineInput[]
  payments: { amount: number; method: PaymentMethod }[]
  mpesa_receipt: string | null
}

export const createOrder = (order: NewOrder) => apiPost('/orders', order)

export const syncOfflineOrders = flushOfflineOrders

export const findOrder = (idOrCode: string | number) =>
  apiGet(`/orders/${encodeURIComponent(String(idOrCode).trim())}`)

export const voidOrder = (userId: number, orderId: number, reason: string) =>
  apiPost('/voids', { user_id: userId, order_id: orderId, reason, restock: true })

export const closeDay = (userId: number, cash: { opening_float: number; counted_cash: number }) =>
  apiPost('/day-closes', { user_id: userId, ...cash })
