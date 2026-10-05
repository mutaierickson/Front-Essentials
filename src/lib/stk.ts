import Swal from 'sweetalert2'
import { mpesaSocketUrl } from '@/lib/api'
import { getStkStatus } from '@/models/paymentModel'

export type StkReason = 'pending' | 'success' | 'cancelled' | 'insufficient_funds' | 'wrong_pin' | 'timeout' | 'failed' | ''

export class StkError extends Error {
  reason: StkReason
  silent: boolean
  constructor(message: string, reason: StkReason, silent = false) {
    super(message)
    this.reason = reason
    this.silent = silent
  }
}

export function stkBoxClass(reason: StkReason) {
  if (reason === 'cancelled') return 'border-amber-200 bg-amber-50'
  if (['insufficient_funds', 'wrong_pin', 'timeout', 'failed'].includes(reason)) return 'border-red-200 bg-red-50'
  if (reason === 'success') return 'border-emerald-200 bg-emerald-50'
  return 'border-emerald-100 bg-emerald-50'
}

export function stkTextClass(reason: StkReason) {
  if (reason === 'cancelled') return 'text-amber-800'
  if (['insufficient_funds', 'wrong_pin', 'timeout', 'failed'].includes(reason)) return 'text-red-700'
  return 'text-emerald-800'
}

export function stkAlert(reason: StkReason, message: string) {
  const styles: Record<string, { icon: 'success' | 'error' | 'warning' | 'info'; title: string }> = {
    success: { icon: 'success', title: 'Payment received' },
    cancelled: { icon: 'warning', title: 'Customer cancelled' },
    insufficient_funds: { icon: 'error', title: 'Insufficient funds' },
    wrong_pin: { icon: 'error', title: 'Wrong M-Pesa PIN' },
    timeout: { icon: 'warning', title: 'Prompt timed out' },
    failed: { icon: 'error', title: 'Payment failed' },
    pending: { icon: 'info', title: 'Waiting for PIN' }
  }
  const style = styles[reason] || styles.failed
  return Swal.fire({
    icon: style.icon,
    title: style.title,
    text: message,
    confirmButtonColor: '#1e293b'
  })
}

type StkEvent = {
  status?: string
  reason?: string
  message?: string
  mpesaReceipt?: string
  mpesa_receipt?: string
  result_desc?: string
}

export function waitForStk(
  checkoutRequestId: string,
  options: {
    onEvent: (event: StkEvent) => void
    cancelRef: { current: (() => void) | null }
  }
) {
  return new Promise<{ mpesa_receipt?: string }>((resolve, reject) => {
    let settled = false
    let pollTimer: ReturnType<typeof setInterval> | null = null
    let timeout: ReturnType<typeof setTimeout> | null = null
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null
    let socketOpen = false
    const socket = new WebSocket(mpesaSocketUrl())

    const finish = (error?: Error, data?: { mpesa_receipt?: string }) => {
      if (settled) return
      settled = true
      options.cancelRef.current = null
      if (pollTimer) clearInterval(pollTimer)
      if (timeout) clearTimeout(timeout)
      if (fallbackTimer) clearTimeout(fallbackTimer)
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close()
      }
      if (error) reject(error)
      else resolve(data || {})
    }

    options.cancelRef.current = () => finish(new StkError('Payment cancelled', 'cancelled', true))

    const handleEvent = (event: StkEvent) => {
      options.onEvent(event)
      if (event.status === 'success') {
        finish(undefined, { mpesa_receipt: event.mpesaReceipt || event.mpesa_receipt })
      } else if (event.status === 'failed' || event.status === 'cancelled') {
        finish(new StkError(event.message || 'M-Pesa payment was not completed', (event.reason as StkReason) || 'failed'))
      }
    }

    timeout = setTimeout(() => {
      const message = 'The prompt timed out. The customer did not enter their PIN in time.'
      options.onEvent({ status: 'failed', reason: 'timeout', message })
      finish(new StkError(message, 'timeout'))
    }, 90_000)

    const startPoll = () => {
      if (pollTimer || settled) return
      const poll = async () => {
        try {
          const data = await getStkStatus(checkoutRequestId)
          handleEvent({
            status: data.status,
            reason: data.reason || undefined,
            message: data.result_desc,
            mpesa_receipt: data.mpesa_receipt || undefined
          })
        } catch {
          // keep waiting on socket
        }
      }
      pollTimer = setInterval(poll, 4000)
      poll()
    }

    socket.onopen = () => {
      socketOpen = true
      socket.send(JSON.stringify({ type: 'subscribe', checkoutRequestId }))
    }
    socket.onmessage = (ev) => {
      try {
        handleEvent(JSON.parse(ev.data))
      } catch {
        // ignore malformed frames
      }
    }
    socket.onerror = () => {
      if (!settled) startPoll()
    }
    fallbackTimer = setTimeout(() => {
      if (!socketOpen && !settled) startPoll()
    }, 2000)
  })
}
