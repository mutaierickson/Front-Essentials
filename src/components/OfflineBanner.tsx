import { useEffect, useState } from 'react'
import { syncOfflineOrders as flushOfflineOrders } from '@/models/orderModel'
import { queuedSales } from '@/lib/offline'

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  const [pending, setPending] = useState(() => queuedSales().length)

  useEffect(() => {
    const onOnline = async () => {
      setOnline(true)
      await flushOfflineOrders()
      setPending(queuedSales().length)
    }
    const onOffline = () => setOnline(false)
    const onQueue = () => setPending(queuedSales().length)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('pos-offline-change', onQueue)
    if (navigator.onLine) flushOfflineOrders().then(() => setPending(queuedSales().length))
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('pos-offline-change', onQueue)
    }
  }, [])

  if (online && pending === 0) return null

  return (
    <div className={`text-sm px-3 py-2 text-center ${online ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100' : 'bg-amber-50 text-amber-900 border-b border-amber-100'}`}>
      {online
        ? `Connection restored. ${pending} saved sale${pending === 1 ? '' : 's'} still waiting to sync.`
        : pending
          ? `Working offline. ${pending} sale${pending === 1 ? '' : 's'} saved on this device and will sync later.`
          : 'Working offline. Cached products and your saved session are still available.'}
    </div>
  )
}
