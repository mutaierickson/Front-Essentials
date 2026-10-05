import { cacheGet, cacheSet, enqueueOrder, isOfflineError, queuedSales, setQueuedSales } from '@/lib/offline'

export const API_URL = import.meta.env.VITE_API_URL || '/api'

export function mpesaSocketUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/mpesa`
}

export async function readApiJson(res: Response) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    throw new Error(
      res.ok
        ? 'The server returned an invalid response'
        : `API unavailable (${res.status}). Make sure the backend is running.`
    )
  }
}

type RequestOptions = RequestInit & { skipOffline?: boolean }

export async function apiRequest(path: string, options: RequestOptions = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers })
    const data = await readApiJson(res)
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`)
    }
    if (method === 'GET') cacheSet(path, data)
    return data
  } catch (error) {
    if (options.skipOffline) throw error
    if (method === 'GET') {
      const cached = cacheGet(path)
      if (cached != null) return cached
    }
    if (method === 'POST' && path === '/orders' && isOfflineError(error)) {
      return enqueueOrder(options.body ? JSON.parse(String(options.body)) : {})
    }
    throw error
  }
}

export const apiGet = (path: string) => apiRequest(path)

export const apiPost = (path: string, body?: unknown) =>
  apiRequest(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })

export const apiPut = (path: string, body?: unknown) =>
  apiRequest(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) })

export const apiDelete = (path: string) => apiRequest(path, { method: 'DELETE' })

export async function flushOfflineOrders() {
  const queue = queuedSales()
  if (!queue.length || !navigator.onLine) return { synced: 0, remaining: queue.length }
  const leftover = []
  let synced = 0
  for (const sale of queue) {
    try {
      await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(sale.payload),
        skipOffline: true
      })
      synced += 1
    } catch {
      leftover.push(sale)
    }
  }
  setQueuedSales(leftover)
  return { synced, remaining: leftover.length }
}
