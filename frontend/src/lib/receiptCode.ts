const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function makeReceiptCode(orderId: number) {
  const id = Number(orderId)
  const body = id.toString(36).toUpperCase().padStart(5, '0')
  const check = ALPHABET[id % ALPHABET.length]
  return `ED-${body}${check}`
}

export function looksLikeReceiptCode(raw: string) {
  return /^#?ED-?[0-9A-Z]{6}$/i.test(String(raw || '').trim())
}
