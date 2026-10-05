import Swal from 'sweetalert2'
import { formatKsh } from '@/lib/utils'
import { DashboardData } from '@/types/dashboard'

export function formatVariance(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  const amount = Number(value)
  if (Number.isNaN(amount) || Math.abs(amount) < 0.005) return 'Balanced'
  return amount > 0 ? `Over ${formatKsh(amount)}` : `Short ${formatKsh(-amount)}`
}

export function varianceClass(value: number | null | undefined) {
  if (value === null || value === undefined || Math.abs(Number(value)) < 0.005) return 'text-emerald-700'
  return Number(value) < 0 ? 'text-red-700' : 'text-amber-700'
}

export async function confirmCloseDay(stats: DashboardData, notes: string) {
  const openCount = Number(stats.open_shift?.transactions || 0)
  const openSales = Number(stats.open_shift?.sales || 0)
  const cashSales = Number(stats.open_shift?.cash_sales || 0)
  const cashRefunds = Number(stats.open_shift?.cash_refunds || 0)
  const cashExtras = Number(stats.open_shift?.cash_extras || 0)
  const suggested = Number(stats.suggested_float || 0)
  const result = await Swal.fire({
    icon: 'question',
    title: "Close today's sales?",
    html: `
      <p>Submit <strong>${openCount}</strong> receipt${openCount === 1 ? '' : 's'} totaling <strong>${formatKsh(openSales)}</strong> to the manager dashboard.</p>
      ${notes ? `<p class="text-sm mt-2">${notes}</p>` : ''}
      <p class="text-sm mt-3 text-left">Cash sales ${formatKsh(cashSales)}${cashRefunds ? ` · refunds ${formatKsh(cashRefunds)}` : ''}${cashExtras ? ` · extras ${formatKsh(cashExtras)}` : ''}</p>
      <p class="text-sm text-left">Expected drawer = opening float + cash sales − cash refunds + extras.</p>
      <input id="swal-float" class="swal2-input" type="number" min="0" step="0.01" value="${suggested || 0}" placeholder="Opening float (Ksh)">
      <input id="swal-counted" class="swal2-input" type="number" min="0" step="0.01" placeholder="Counted cash in drawer (Ksh)">
    `,
    showCancelButton: true,
    confirmButtonColor: '#1e293b',
    confirmButtonText: 'Close day',
    cancelButtonText: 'Not yet',
    focusConfirm: false,
    preConfirm: () => {
      const openingRaw = (document.getElementById('swal-float') as HTMLInputElement | null)?.value
      const countedRaw = (document.getElementById('swal-counted') as HTMLInputElement | null)?.value
      if (countedRaw === undefined || countedRaw === '') {
        Swal.showValidationMessage('Enter the cash counted in the drawer')
        return false
      }
      const opening_float = Number(openingRaw || 0)
      const counted_cash = Number(countedRaw)
      if (Number.isNaN(opening_float) || Number.isNaN(counted_cash) || opening_float < 0 || counted_cash < 0) {
        Swal.showValidationMessage('Cash amounts cannot be negative')
        return false
      }
      return { opening_float, counted_cash }
    }
  })
  if (!result.isConfirmed || !result.value) return null
  return result.value as { opening_float: number; counted_cash: number }
}
