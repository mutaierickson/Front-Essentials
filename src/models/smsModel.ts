import { apiGet, apiPost } from '@/lib/api'

export type SmsStatus = {
  configured: boolean
  remaining?: number | null
  balance: number | string | null
  shortcode: string | null
  error?: string
}

export type SmsCampaign = {
  id: number
  username?: string | null
  title: string
  message: string
  recipient_count: number
  sent_count: number
  failed_count: number
  status: string
  created_at: string
}

export type BulkSmsRequest = {
  title: string
  message: string
  send_all: boolean
  customer_ids: number[]
  extra_phones: string
  user_id?: number
}

export type BulkSmsResult = {
  id: number
  recipient_count: number
  sent_count: number
  failed_count: number
  invalid?: string[]
  remaining: number | null
  status: string
}

export const unconfiguredStatus: SmsStatus = { configured: false, remaining: null, balance: null, shortcode: null }

export function remainingFrom(status: SmsStatus | null) {
  if (!status) return null
  const value = status.remaining ?? (status.balance == null ? null : Number(status.balance))
  return value == null || Number.isNaN(Number(value)) ? null : Number(value)
}

export const getSmsStatus = (): Promise<SmsStatus> => apiGet('/sms/status')

export const listCampaigns = (): Promise<SmsCampaign[]> => apiGet('/sms/campaigns')

export const sendBulkSms = (request: BulkSmsRequest): Promise<BulkSmsResult> => apiPost('/sms/bulk', request)
