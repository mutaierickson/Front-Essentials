export function profitPercentFromSelling(sellingPrice: number, buyingPrice: number): number | null {
  if (!Number.isFinite(sellingPrice) || sellingPrice <= 0 || !Number.isFinite(buyingPrice)) return null
  return ((sellingPrice - buyingPrice) / sellingPrice) * 100
}

export function formatProfitPercent(percent: number | null): string {
  if (percent === null) return '—'
  return `${percent.toFixed(1)}%`
}

export function profitTone(percent: number | null) {
  if (percent === null) return 'bg-slate-100 text-slate-500'
  return percent >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
}
