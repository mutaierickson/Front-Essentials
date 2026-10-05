import { looksLikeReceiptCode } from '@/lib/receiptCode'

export function normalizeBarcode(raw: string | null | undefined) {
  return String(raw || '').trim().replace(/\s+/g, '').toUpperCase()
}

export function looksLikeProductBarcode(raw: string) {
  const value = normalizeBarcode(raw)
  if (!value || looksLikeReceiptCode(value)) return false
  return /^[0-9A-Z._-]{4,64}$/.test(value)
}

export function findByBarcode<T extends { barcode?: string | null }>(items: T[], raw: string) {
  const value = normalizeBarcode(raw)
  if (!value) return null
  return items.find((item) => normalizeBarcode(item.barcode) === value) || null
}
