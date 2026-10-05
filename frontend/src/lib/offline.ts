const CACHE_PREFIX = 'pos_cache:'
const QUEUE_KEY = 'pos_offline_orders'
const USERNAME_KEY = 'pos_last_username'

export const isOfflineError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '')
  return (
    !navigator.onLine ||
    /failed to fetch|networkerror|load failed|api unavailable|the server returned an invalid/i.test(message)
  )
}

const notify = () => window.dispatchEvent(new Event('pos-offline-change'))

export function cacheSet(path: string, data: unknown) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${path}`, JSON.stringify({ at: Date.now(), data }))
  } catch {
    // quota
  }
}

export function cacheGet<T = any>(path: string): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${path}`)
    if (!raw) return null
    return JSON.parse(raw).data as T
  } catch {
    return null
  }
}

export type QueuedSale = {
  id: number
  receipt_code: string
  payload: unknown
  at: string
}

export function queuedSales(): QueuedSale[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}

export function enqueueOrder(payload: unknown): QueuedSale & { offline: true; success: true } {
  const id = -Date.now()
  const receipt_code = `ED-OFF${Math.abs(id).toString(36).toUpperCase().slice(-5)}`
  const next = [...queuedSales(), { id, receipt_code, payload, at: new Date().toISOString() }]
  localStorage.setItem(QUEUE_KEY, JSON.stringify(next))
  notify()
  return { id, receipt_code, payload, at: next[next.length - 1].at, offline: true, success: true }
}

export function setQueuedSales(next: QueuedSale[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(next))
  notify()
}

export function saveLastUsername(username: string) {
  localStorage.setItem(USERNAME_KEY, username)
}

export function lastUsername() {
  return localStorage.getItem(USERNAME_KEY) || ''
}

export function readStoredProfile() {
  const raw = localStorage.getItem('pos_user') || sessionStorage.getItem('pos_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeStoredProfile(profile: unknown, persist: boolean) {
  const json = JSON.stringify(profile)
  localStorage.removeItem('pos_user')
  sessionStorage.removeItem('pos_user')
  if (persist) localStorage.setItem('pos_user', json)
  else sessionStorage.setItem('pos_user', json)
  localStorage.setItem('pos_session_meta', JSON.stringify({ savedAt: Date.now(), persist }))
}

export function clearStoredProfile() {
  localStorage.removeItem('pos_user')
  sessionStorage.removeItem('pos_user')
}
