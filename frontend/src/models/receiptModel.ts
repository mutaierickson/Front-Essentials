import { makeReceiptCode } from '@/lib/receiptCode'

export type ReceiptLine = {
  name: string
  quantity: number
  price: number
  size?: string | null
  color?: string | null
}

export type ReceiptOrder = {
  items: ReceiptLine[]
  total: number
  customerName?: string | null
  method?: string | null
  createdAt?: string | null
  receiptCode?: string | null
  vatAmount?: number | null
  vatRate?: number | null
  payments?: { method: string; amount: number }[]
  voided?: boolean
}

export function receiptFromApi(data: any): ReceiptOrder {
  return {
    items: (data.items || []).map((item: any) => ({
      name: item.name || 'Item',
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color
    })),
    total: Number(data.total_amount),
    customerName: data.customer_name,
    method: data.method,
    createdAt: data.created_at,
    receiptCode: data.receipt_code || makeReceiptCode(data.id),
    vatAmount: Number(data.vat_amount || 0),
    vatRate: Number(data.vat_rate || 16),
    payments: data.payments || [],
    voided: Boolean(Number(data.voided))
  }
}
