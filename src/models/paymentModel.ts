import { apiGet, apiPost } from '@/lib/api'

export type StkPushResponse = {
  checkout_request_id: string
  status: string
  reason?: string
  message?: string
}

export type StkStatusResponse = {
  checkout_request_id: string
  status: string
  reason: string | null
  result_desc?: string
  mpesa_receipt: string | null
}

export const sendStkPush = (phone: string, amount: number): Promise<StkPushResponse> =>
  apiPost('/payments/mpesa/stkpush', { phone, amount, account_reference: 'ESSENTIALS' })

export const getStkStatus = (checkoutRequestId: string): Promise<StkStatusResponse> =>
  apiGet(`/payments/mpesa/status/${checkoutRequestId}`)
