import { apiPost } from '@/lib/api'
import { PaymentMethod } from '@/models/orderModel'

export type NewReturn = {
  user_id: number
  order_id: number
  method: PaymentMethod
  reason: string
  restock: boolean
  items: { order_item_id: number; quantity: number }[]
  exchange_items: { product_id: number; quantity: number; unit_price: number; unit_cost: number }[]
}

export const createReturn = (payload: NewReturn) => apiPost('/returns', payload)
