import { useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { CartItem } from '@/types'
import { StkError, StkReason, stkAlert, waitForStk } from '@/lib/stk'
import { createOrder, PaymentMethod } from '@/models/orderModel'
import { sendStkPush } from '@/models/paymentModel'

export type CheckoutMethod = PaymentMethod | 'Split'

export type CheckoutSuccess = (saleId: number, receiptCode?: string, extras?: { method?: string | null; vat_amount?: number }) => void

type Options = {
  isOpen: boolean
  cart: CartItem[]
  total: number
  initialCustomerName: string
  userId: number
  onSuccess: CheckoutSuccess
}

export function useCheckoutController({ isOpen, cart, total, initialCustomerName, userId, onSuccess }: Options) {
  const [paymentMethod, setPaymentMethod] = useState<CheckoutMethod>('Cash')
  const [amountReceivedStr, setAmountReceivedStr] = useState('')
  const [splitCashStr, setSplitCashStr] = useState('')
  const [splitRest, setSplitRest] = useState<'Card' | 'Mobile'>('Mobile')
  const [customerName, setCustomerName] = useState(initialCustomerName)
  const [phone, setPhone] = useState('')
  const [stkMessage, setStkMessage] = useState('')
  const [stkReason, setStkReason] = useState<StkReason>('')
  const [loading, setLoading] = useState(false)
  const cancelStkRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (isOpen) setCustomerName(initialCustomerName || '')
    else {
      cancelStkRef.current?.()
      cancelStkRef.current = null
    }
    return () => { cancelStkRef.current?.() }
  }, [isOpen, initialCustomerName])

  const amountReceived = parseFloat(amountReceivedStr) || 0
  const splitCash = Math.round((parseFloat(splitCashStr) || 0) * 100) / 100
  const splitRemainder = Math.round((total - splitCash) * 100) / 100
  const cashDue = paymentMethod === 'Split' ? splitCash : total
  const balance = amountReceived - cashDue
  const needsPhone = paymentMethod === 'Mobile' || (paymentMethod === 'Split' && splitRest === 'Mobile')
  const takesCash = paymentMethod === 'Cash' || paymentMethod === 'Split'
  const waitingForMpesa = loading && needsPhone
  const cashDenoms = [50, 100, 200, 500, 1000]
    .map(denom => Math.ceil(cashDue / denom) * denom)
    .filter((value, index, list) => value >= cashDue && list.indexOf(value) === index)
    .slice(0, 4)
  const canComplete = !loading
    && !(takesCash && amountReceived < cashDue)
    && !(needsPhone && !phone.trim())
    && !(paymentMethod === 'Split' && (splitCash <= 0 || splitRemainder <= 0))

  const choosePaymentMethod = (method: CheckoutMethod) => {
    setPaymentMethod(method)
    setStkMessage('')
    setStkReason('')
  }

  const resetForm = () => {
    setAmountReceivedStr('')
    setSplitCashStr('')
    setSplitRest('Mobile')
    setCustomerName('')
    setPhone('')
    setStkMessage('')
    setStkReason('')
  }

  const completeSale = async (payments: { amount: number; method: PaymentMethod }[], mpesaReceipt?: string) => {
    const original = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const factor = original > 0 ? total / original : 1
    const items = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: Number((item.price * factor).toFixed(2)),
      unit_cost: item.cost || 0,
      subtotal: Number((item.price * item.quantity * factor).toFixed(2))
    }))
    const data = await createOrder({
      user_id: userId,
      customer_name: customerName || 'Walk-in Customer',
      customer_phone: phone.trim() || null,
      items,
      payments,
      mpesa_receipt: mpesaReceipt || null
    })
    onSuccess(data.id, data.receipt_code, {
      method: payments.length > 1 ? 'Split' : payments[0]?.method,
      vat_amount: data.vat_amount
    })
    return data
  }

  const complete = async () => {
    if (takesCash && amountReceived < cashDue) {
      await Swal.fire({ icon: 'warning', title: 'Amount too low', text: 'Cash received is less than the cash due', confirmButtonColor: '#1e293b' })
      return
    }
    if (paymentMethod === 'Split' && (splitCash <= 0 || splitRemainder <= 0)) {
      await Swal.fire({ icon: 'warning', title: 'Split the total', text: 'Cash must be more than 0 and less than the sale total.', confirmButtonColor: '#1e293b' })
      return
    }
    if (needsPhone && !phone.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Phone required', text: 'Enter the customer M-Pesa number', confirmButtonColor: '#1e293b' })
      return
    }

    const payments = paymentMethod === 'Split'
      ? [{ amount: splitCash, method: 'Cash' as const }, { amount: splitRemainder, method: splitRest }]
      : [{ amount: total, method: paymentMethod }]
    const stkAmount = payments.find(pay => pay.method === 'Mobile')?.amount || 0

    setLoading(true)
    setStkMessage('')
    setStkReason('')
    try {
      if (stkAmount > 0) {
        setStkReason('pending')
        setStkMessage('Sending M-Pesa prompt...')
        Swal.fire({
          title: 'Sending M-Pesa prompt...',
          text: 'Ask the customer to check their phone and enter their PIN.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => { Swal.showLoading() }
        })
        const stkData = await sendStkPush(phone, stkAmount)
        setStkMessage(stkData.message || 'Ask the customer to enter their M-Pesa PIN')
        Swal.update({ title: 'Waiting for PIN...', text: stkData.message || 'Ask the customer to enter their M-Pesa PIN.' })
        const confirmed = await waitForStk(stkData.checkout_request_id, {
          cancelRef: cancelStkRef,
          onEvent: (event) => {
            if (event.message) setStkMessage(event.message)
            if (event.reason) setStkReason(event.reason as StkReason)
          }
        })
        await completeSale(payments, confirmed.mpesa_receipt)
        await stkAlert('success', 'Payment received. The sale has been completed.')
      } else {
        const sale = await completeSale(payments)
        await Swal.fire({
          icon: sale?.offline ? 'info' : 'success',
          title: sale?.offline ? 'Sale saved on this device' : 'Sale completed',
          text: sale?.offline
            ? 'It will upload automatically when the connection returns.'
            : 'The sale has been recorded.',
          timer: 1800,
          showConfirmButton: false
        })
      }
      resetForm()
    } catch (error: any) {
      if (error instanceof StkError && error.silent) {
        Swal.close()
        return
      }
      const reason: StkReason = error instanceof StkError ? error.reason : 'failed'
      const message = error.message || 'Payment failed'
      setStkReason(reason)
      setStkMessage(message)
      await stkAlert(reason, message)
    } finally {
      setLoading(false)
    }
  }

  return {
    paymentMethod, choosePaymentMethod, amountReceivedStr, setAmountReceivedStr,
    splitCashStr, setSplitCashStr, splitRest, setSplitRest, customerName, setCustomerName,
    phone, setPhone, stkMessage, stkReason, loading, splitRemainder, cashDue, balance,
    needsPhone, takesCash, waitingForMpesa, cashDenoms, canComplete, complete
  }
}
