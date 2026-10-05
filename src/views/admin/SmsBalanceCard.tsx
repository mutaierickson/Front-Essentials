import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { remainingFrom, type SmsStatus } from '@/models/smsModel'

const HIGH_KEY = 'essentials_sms_high_credit'

function formatUnits(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

function readHigh() {
  try {
    return Number(localStorage.getItem(HIGH_KEY) || 0)
  } catch {
    return 0
  }
}

export function SmsBalanceCard({
  status,
  unitsNeeded,
  refreshing,
  onRefresh
}: {
  status: SmsStatus | null
  unitsNeeded: number
  refreshing: boolean
  onRefresh: () => void
}) {
  const remaining = remainingFrom(status)
  const [high, setHigh] = useState(readHigh)

  useEffect(() => {
    if (remaining == null) return
    const next = Math.max(readHigh(), remaining)
    try { localStorage.setItem(HIGH_KEY, String(next)) } catch { /* ignore */ }
    setHigh(next)
  }, [remaining])
  const fill = remaining == null || high <= 0 ? 0 : Math.max(4, Math.min(100, (remaining / high) * 100))
  const afterSend = remaining == null ? null : remaining - unitsNeeded
  const messagesLeft = remaining == null ? null : Math.floor(remaining)
  const low = remaining != null && remaining <= 20
  const empty = remaining === 0
  const notEnough = remaining != null && unitsNeeded > remaining
  const tone = empty || notEnough ? 'text-red-700' : low ? 'text-amber-700' : 'text-emerald-700'
  const bar = empty || notEnough ? 'bg-red-600' : low ? 'bg-amber-500' : 'bg-emerald-600'
  const chip = empty
    ? 'Depleted'
    : notEnough
      ? 'Not enough for this send'
      : low
        ? 'Running low'
        : remaining == null
          ? 'Checking'
          : 'Healthy'

  const hint = status?.error
    ? status.error
    : !status
      ? 'Reading your SMS account…'
      : !status.configured
        ? 'Add SMS keys in .env'
        : remaining == null
          ? 'Balance unavailable right now'
          : unitsNeeded > 0
            ? `This send uses ${formatUnits(unitsNeeded)} · ${afterSend != null && afterSend >= 0 ? `${formatUnits(afterSend)} left after send` : 'short of this send'}`
            : `${formatUnits(messagesLeft || 0)} single-unit messages available`

  return (
    <Card className={`border shadow-sm min-w-[280px] ${empty || notEnough ? 'border-red-200 bg-red-50' : low ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">SMS remaining</p>
            <p className={`text-3xl font-bold tabular-nums ${status && remaining == null && status.error ? 'text-slate-400' : tone}`}>
              {!status ? '…' : remaining == null ? '—' : formatUnits(remaining)}
            </p>
          </div>
          <Button variant="outline" size="icon" className="border-slate-200 shrink-0 bg-white" onClick={onRefresh} disabled={refreshing} aria-label="Refresh SMS balance">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="h-2 rounded-full bg-white/80 border border-black/5 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${fill}%` }} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-semibold ${tone}`}>{chip}</span>
          {status?.shortcode && <span className="text-xs text-slate-500 truncate">Sender {status.shortcode}</span>}
        </div>
        <p className="text-xs text-slate-600">{hint}</p>
      </CardContent>
    </Card>
  )
}
