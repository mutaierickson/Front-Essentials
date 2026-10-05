import React, { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { FoodItem } from '@/types'
import { formatKsh } from '@/lib/utils'
import { findByBarcode } from '@/lib/barcode'
import { findOrder, PaymentMethod } from '@/models/orderModel'
import { createReturn } from '@/models/returnModel'

export type ReturnLine = {
  order_item_id: number
  product_id: number
  name: string
  quantity: number
  price: number
  size?: string | null
  color?: string | null
  remaining: number
  returned_qty: number
}

export type TakenItem = { product: FoodItem; quantity: number }

type Options = {
  isOpen: boolean
  onClose: () => void
  saleId: number
  userId: number
  products: FoodItem[]
  onSuccess: () => void
}

export function useReturnExchangeController({ isOpen, onClose, saleId, userId, products, onSuccess }: Options) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [receiptCode, setReceiptCode] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('Cash')
  const [reason, setReason] = useState('')
  const [restock, setRestock] = useState(true)
  const [lines, setLines] = useState<ReturnLine[]>([])
  const [qty, setQty] = useState<Record<number, number>>({})
  const [taken, setTaken] = useState<TakenItem[]>([])
  const [search, setSearch] = useState('')
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (!isOpen || !saleId) return
    let cancelled = false
    setLoading(true)
    findOrder(saleId).then((data) => {
      if (cancelled) return
      setReceiptCode(data.receipt_code || '')
      setMethod((data.method === 'Card' || data.method === 'Mobile') ? data.method : 'Cash')
      const nextLines: ReturnLine[] = (data.items || []).map((item: any) => ({
        order_item_id: item.order_item_id,
        product_id: item.product_id,
        name: item.name || 'Item',
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        size: item.size,
        color: item.color,
        remaining: Number(item.remaining ?? item.quantity ?? 0),
        returned_qty: Number(item.returned_qty || 0)
      }))
      setLines(nextLines)
      setQty(Object.fromEntries(nextLines.map((line) => [line.order_item_id, 0])))
      setTaken([])
      setReason('')
      setRestock(true)
      setSearch('')
      setHistory(data.returns || [])
    }).catch(async (error) => {
      await Swal.fire({ icon: 'error', title: 'Receipt unavailable', text: error.message, confirmButtonColor: '#1e293b' })
      onClose()
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isOpen, saleId])

  const returnedValue = useMemo(
    () => lines.reduce((sum, line) => sum + line.price * (qty[line.order_item_id] || 0), 0),
    [lines, qty]
  )
  const exchangeValue = useMemo(
    () => taken.reduce((sum, row) => sum + row.product.price * row.quantity, 0),
    [taken]
  )
  const net = Number((exchangeValue - returnedValue).toFixed(2))
  const returningCount = lines.reduce((sum, line) => sum + (qty[line.order_item_id] || 0), 0)
  const matches = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return products.filter((item) => item.stock_quantity > 0).slice(0, 8)
    return products.filter((item) => `${item.name} ${item.size || ''} ${item.color || ''} ${item.barcode || ''}`.toLowerCase().includes(query)).slice(0, 8)
  }, [products, search])

  const bump = (line: ReturnLine, delta: number) => {
    setQty((prev) => {
      const next = Math.max(0, Math.min(line.remaining, (prev[line.order_item_id] || 0) + delta))
      return { ...prev, [line.order_item_id]: next }
    })
  }

  const addTaken = (product: FoodItem) => {
    setTaken((prev) => {
      const existing = prev.find((row) => row.product.id === product.id)
      const inCart = existing?.quantity || 0
      if (inCart >= product.stock_quantity) return prev
      if (existing) return prev.map((row) => row.product.id === product.id ? { ...row, quantity: row.quantity + 1 } : row)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const pickReplacement = (product: FoodItem) => {
    addTaken(product)
    setSearch('')
  }

  const removeTaken = (productId: number) => {
    setTaken((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const scanned = findByBarcode(products, search)
    if (scanned) pickReplacement(scanned)
  }

  const submit = async () => {
    if (!returningCount) {
      await Swal.fire({ icon: 'warning', title: 'Select items to return', confirmButtonColor: '#1e293b' })
      return
    }
    const isExchange = taken.length > 0
    const moneyText = net > 0
      ? `Collect ${formatKsh(net)} from the customer.`
      : net < 0
        ? `Refund ${formatKsh(-net)} to the customer.`
        : 'Even exchange — no money changes hands.'
    const result = await Swal.fire({
      icon: 'question',
      title: isExchange ? 'Complete this exchange?' : 'Complete this return?',
      html: `<p>${returningCount} item${returningCount === 1 ? '' : 's'} coming back${isExchange ? ` · ${taken.reduce((sum, row) => sum + row.quantity, 0)} going out` : ''}.</p><p class="mt-2">${moneyText}</p>`,
      showCancelButton: true,
      confirmButtonColor: '#1e293b',
      confirmButtonText: isExchange ? 'Exchange' : 'Return'
    })
    if (!result.isConfirmed) return
    setSaving(true)
    try {
      const saved = await createReturn({
        user_id: userId,
        order_id: saleId,
        method,
        reason,
        restock,
        items: lines.map((line) => ({ order_item_id: line.order_item_id, quantity: qty[line.order_item_id] || 0 })).filter((item) => item.quantity > 0),
        exchange_items: taken.map((row) => ({
          product_id: row.product.id,
          quantity: row.quantity,
          unit_price: row.product.price,
          unit_cost: row.product.cost || 0
        }))
      })
      await Swal.fire({
        icon: 'success',
        title: saved.type === 'exchange' ? 'Exchange recorded' : 'Return recorded',
        text: saved.refund_amount
          ? `Refund ${formatKsh(saved.refund_amount)} · ${saved.return_code}`
          : saved.extra_amount
            ? `Collect ${formatKsh(saved.extra_amount)} · ${saved.return_code}`
            : `Even exchange · ${saved.return_code}`,
        confirmButtonColor: '#1e293b'
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Could not complete', text: error.message || 'Try again.', confirmButtonColor: '#1e293b' })
    } finally {
      setSaving(false)
    }
  }

  return {
    loading, saving, receiptCode, method, setMethod, reason, setReason, restock, setRestock,
    lines, qty, taken, search, setSearch, history, returnedValue, exchangeValue, net,
    returningCount, matches, bump, pickReplacement, removeTaken, onSearchKeyDown, submit
  }
}
