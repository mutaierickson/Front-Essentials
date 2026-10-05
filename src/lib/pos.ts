import { CartItem } from '@/types'

export type HeldSale = {
  id: string
  at: string
  customerName: string
  items: CartItem[]
  discountPercent: number
}

export const paymentLabel = (method?: string | null) => {
  if (method === 'Mobile') return 'M-Pesa'
  if (method === 'Split') return 'Split'
  return method || '—'
}

export const heldKey = (userId?: number) => `pos_held_sales_${userId || 'guest'}`
export const lastReceiptKey = (userId?: number) => `pos_last_receipt_${userId || 'guest'}`
export const cartSessionKey = (userId?: number) => `pos_open_cart_${userId || 'guest'}`

export function createCartId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function chipClass(active: boolean) {
  return `rounded-full shadow-sm whitespace-nowrap ${
    active ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'
  }`
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}
