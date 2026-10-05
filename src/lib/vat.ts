const VAT_RATE = 16

export function splitInclusive(total: number, rate = VAT_RATE) {
  const gross = Math.round(Number(total || 0) * 100) / 100
  const vat_amount = Math.round((gross * rate) / (100 + rate) * 100) / 100
  return {
    rate,
    vat_amount,
    net: Math.round((gross - vat_amount) * 100) / 100
  }
}
