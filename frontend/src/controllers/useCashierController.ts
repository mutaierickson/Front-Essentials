import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { formatKsh, formatTimestamp } from '@/lib/utils'
import { looksLikeReceiptCode, makeReceiptCode } from '@/lib/receiptCode'
import { findByBarcode, looksLikeProductBarcode, normalizeBarcode } from '@/lib/barcode'
import { confirmCloseDay, formatVariance } from '@/lib/closeDay'
import { Category, FoodItem } from '@/types'
import { DashboardOrder, emptyDashboard } from '@/types/dashboard'
import { useAuth } from '@/contexts/AuthContext'
import type { CartPanelProps } from '@/views/cashier/CartPanel'
import { lastReceiptKey, readJson, writeJson } from '@/lib/pos'
import { splitInclusive } from '@/lib/vat'
import { ReceiptOrder, receiptFromApi } from '@/models/receiptModel'
import { listCategories } from '@/models/categoryModel'
import { listProducts } from '@/models/productModel'
import { loadDashboard } from '@/models/dashboardModel'
import { closeDay as submitDayClose, findOrder, voidOrder } from '@/models/orderModel'
import { useCashierCartController } from './useCashierCartController'
import Swal from 'sweetalert2'

export function useCashierController() {
  const [view, setView] = useState<'register' | 'shift'>('register')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<FoodItem[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [hideOutOfStock, setHideOutOfStock] = useState(false)
  const [stats, setStats] = useState(emptyDashboard)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [lastSaleId, setLastSaleId] = useState<number | null>(null)
  const [lastOrder, setLastOrder] = useState<ReceiptOrder | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const { profile } = useAuth()
  const cartState = useCashierCartController(profile?.id)

  const loadCatalog = async () => {
    const [catData, prodData] = await Promise.all([listCategories(), listProducts()])
    setCategories(catData)
    setProducts(prodData)
  }

  const loadStats = async () => {
    if (!profile?.id) return
    try {
      setStats(await loadDashboard(profile.id))
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    let cancelled = false
    loadCatalog().catch(console.error).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    loadStats()
    const timer = setInterval(loadStats, 45_000)
    return () => clearInterval(timer)
  }, [profile?.id])

  useEffect(() => {
    const parsed = readJson<{ saleId?: number; order?: ReceiptOrder } | null>(lastReceiptKey(profile?.id), null)
    if (parsed?.saleId && parsed?.order) {
      setLastSaleId(parsed.saleId)
      setLastOrder(parsed.order)
    }
  }, [profile?.id])

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return products.filter(item => {
      const matchesCategory = activeCategory ? item.category_id === activeCategory : true
      const haystack = `${item.name} ${item.size || ''} ${item.color || ''} ${item.barcode || ''}`.toLowerCase()
      return matchesCategory && (!query || haystack.includes(query)) && (!hideOutOfStock || item.stock_quantity > 0)
    })
  }, [products, activeCategory, searchQuery, hideOutOfStock])

  const openReceipt = (saleId: number, order: ReceiptOrder) => {
    setLastSaleId(saleId)
    setLastOrder(order)
    writeJson(lastReceiptKey(profile?.id), { saleId, order })
    setIsReceiptOpen(true)
  }

  const reprintOrder = async (order: DashboardOrder) => {
    try {
      const data = await findOrder(order.receipt_code || order.id)
      openReceipt(data.id, receiptFromApi(data))
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Receipt unavailable', text: error.message || 'Could not load that receipt.', confirmButtonColor: '#1e293b' })
    }
  }

  const lookupReceipt = async (preset?: string) => {
    const typed = preset ?? (await Swal.fire({
      title: 'Find receipt',
      text: 'Scan the barcode/QR or type the unique code from the receipt.',
      input: 'text',
      inputPlaceholder: 'ED-00007C or receipt number',
      showCancelButton: true,
      confirmButtonColor: '#1e293b',
      confirmButtonText: 'Find'
    })).value
    if (!typed) return
    try {
      const data = await findOrder(typed)
      openReceipt(data.id, receiptFromApi(data))
    } catch {
      await Swal.fire({ icon: 'error', title: 'Not found', text: 'No sale matches that receipt code.', confirmButtonColor: '#1e293b' })
    }
  }

  const closeDay = async () => {
    if (!profile?.id) return
    const openCount = Number(stats.open_shift?.transactions || 0)
    if (openCount === 0) {
      await Swal.fire({
        icon: 'info',
        title: 'Nothing to close',
        text: stats.last_close
          ? `Today's sales are already closed. Last close was ${formatTimestamp(stats.last_close.closed_at)}.`
          : 'There are no completed sales on this shift yet.',
        confirmButtonColor: '#1e293b'
      })
      return
    }
    const extra = [
      cartState.heldSales.length ? `${cartState.heldSales.length} held cart${cartState.heldSales.length === 1 ? '' : 's'} will stay parked.` : '',
      cartState.cart.length ? 'The current cart is not part of this close.' : ''
    ].filter(Boolean).join(' ')
    let snapshot = stats
    try {
      snapshot = await loadDashboard(profile.id)
      setStats(snapshot)
    } catch {}
    const cash = await confirmCloseDay(snapshot, extra)
    if (!cash) return
    try {
      const closed = await submitDayClose(profile.id, cash)
      await loadStats()
      await Swal.fire({
        icon: Math.abs(Number(closed.variance || 0)) < 0.005 ? 'success' : 'warning',
        title: Math.abs(Number(closed.variance || 0)) < 0.005 ? 'Drawer balanced' : formatVariance(closed.variance),
        text: `${closed.sales_count} receipt${Number(closed.sales_count) === 1 ? '' : 's'} · ${formatKsh(closed.sales_total)}. Expected ${formatKsh(closed.expected_cash)} · counted ${formatKsh(closed.counted_cash)}.`,
        confirmButtonColor: '#1e293b'
      })
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Could not close sales', text: error.message || 'Try again.', confirmButtonColor: '#1e293b' })
    }
  }

  const handleCheckoutSuccess = (saleId: number, receiptCode?: string, extras?: { method?: string | null; vat_amount?: number }) => {
    setProducts(prev => prev.map(product => {
      const sold = cartState.cart.find(item => item.id === product.id)
      if (!sold) return product
      return { ...product, stock_quantity: Math.max(0, product.stock_quantity - sold.quantity) }
    }))
    const vat = splitInclusive(cartState.cartTotal)
    openReceipt(saleId, {
      items: cartState.cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price, size: item.size, color: item.color })),
      total: cartState.cartTotal,
      customerName: cartState.customerName || 'Walk-in Customer',
      createdAt: new Date().toISOString(),
      receiptCode: receiptCode || makeReceiptCode(saleId),
      method: extras?.method || null,
      vatAmount: extras?.vat_amount ?? vat.vat_amount,
      vatRate: vat.rate
    })
    setIsCheckoutOpen(false)
    setCartOpen(false)
    cartState.resetCart()
    loadStats()
  }

  useEffect(() => {
    const onKey = (e: WindowEventMap['keydown']) => {
      const tag = (e.target as HTMLElement)?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      if (e.key === 'F2') {
        e.preventDefault()
        setView('register')
        searchRef.current?.focus()
        searchRef.current?.select()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && cartState.cart.length && !isCheckoutOpen) {
        e.preventDefault()
        setView('register')
        setIsCheckoutOpen(true)
      }
      if (!typing && e.key.toLowerCase() === 'h' && cartState.cart.length && !isCheckoutOpen) {
        e.preventDefault()
        cartState.holdSale()
      }
      if (!typing && e.key === '?') {
        e.preventDefault()
        setShowShortcuts(value => !value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartState.cart, isCheckoutOpen, cartState.customerName, cartState.discountPercent, cartState.heldSales, cartState.holdSale])

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const typed = searchQuery.trim()
    if (!typed) return
    if (looksLikeReceiptCode(typed)) {
      setSearchQuery('')
      lookupReceipt(typed)
      return
    }
    const scanned = findByBarcode(products, typed)
    if (scanned) {
      cartState.addToCart(scanned)
      setSearchQuery('')
      return
    }
    if (looksLikeProductBarcode(typed)) {
      Swal.fire({
        icon: 'error',
        title: 'Unknown barcode',
        text: `No product is tagged ${normalizeBarcode(typed)}.`,
        confirmButtonColor: '#1e293b'
      })
      return
    }
    if (filteredItems.length === 1) {
      cartState.addToCart(filteredItems[0])
      setSearchQuery('')
    }
  }

  const openReturn = (order?: DashboardOrder) => {
    if (order?.id) setLastSaleId(order.id)
    setIsReceiptOpen(false)
    setIsReturnOpen(true)
  }

  const handleReturnSuccess = () => {
    loadCatalog()
    loadStats()
  }

  const voidSale = async (order?: DashboardOrder) => {
    if (!profile?.id) return
    const targetId = order?.id || lastSaleId
    if (!targetId) {
      await Swal.fire({ icon: 'info', title: 'No receipt', text: 'Open a receipt first.', confirmButtonColor: '#1e293b' })
      return
    }
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Void this sale?',
      text: 'Stock comes back onto the shelf. This cannot be undone.',
      input: 'text',
      inputPlaceholder: 'Reason (required)',
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      confirmButtonText: 'Void sale',
      cancelButtonText: 'Keep sale'
    })
    if (!result.isConfirmed) return
    const reason = String(result.value || '').trim()
    if (!reason) {
      await Swal.fire({ icon: 'warning', title: 'Reason required', text: 'Enter why this sale is being voided.', confirmButtonColor: '#1e293b' })
      return
    }
    try {
      await voidOrder(profile.id, targetId, reason)
      if (lastOrder && lastSaleId === targetId) {
        setLastOrder({ ...lastOrder, voided: true })
      }
      setIsReceiptOpen(false)
      loadCatalog()
      loadStats()
      await Swal.fire({ icon: 'success', title: 'Sale voided', text: 'The receipt is cancelled and stock was restored.', confirmButtonColor: '#1e293b' })
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Could not void', text: error.message || 'Try again.', confirmButtonColor: '#1e293b' })
    }
  }

  const openCheckout = () => {
    setCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const recallSale = (sale: Parameters<typeof cartState.recallSale>[0]) => {
    cartState.recallSale(sale)
    setView('register')
  }

  const cartProps: CartPanelProps = {
    itemCount: cartState.itemCount,
    cart: cartState.cart,
    customerName: cartState.customerName,
    setCustomerName: cartState.setCustomerName,
    removeFromCart: cartState.removeFromCart,
    updateQuantity: cartState.updateQuantity,
    setCartQuantity: cartState.setCartQuantity,
    discountPercent: cartState.discountPercent,
    setDiscountPercent: cartState.setDiscountPercent,
    subtotal: cartState.subtotal,
    discountAmount: cartState.discountAmount,
    cartTotal: cartState.cartTotal,
    holdSale: cartState.holdSale,
    clearCart: cartState.clearCart,
    heldSales: cartState.heldSales,
    showHeld: cartState.showHeld,
    setShowHeld: cartState.setShowHeld,
    recallSale,
    discardHeld: cartState.discardHeld,
    canCheckout: Boolean(profile?.id),
    onCheckout: openCheckout
  }

  return {
    profile, view, setView, searchRef, searchQuery, setSearchQuery, onSearchKeyDown,
    hideOutOfStock, setHideOutOfStock, activeCategory, setActiveCategory, categories, loading,
    filteredItems, cartQtyById: cartState.cartQtyById, addToCart: cartState.addToCart, cartProps,
    cart: cartState.cart, cartTotal: cartState.cartTotal, itemCount: cartState.itemCount,
    discountAmount: cartState.discountAmount, cartOpen, setCartOpen, showShortcuts, setShowShortcuts,
    isCheckoutOpen, setIsCheckoutOpen, isReceiptOpen, setIsReceiptOpen, lastSaleId, lastOrder, stats,
    heldSales: cartState.heldSales, loadStats, lookupReceipt, closeDay, reprintOrder, recallSale,
    discardHeld: cartState.discardHeld, handleCheckoutSuccess, openCheckout,
    isReturnOpen, setIsReturnOpen, products, openReturn, handleReturnSuccess, voidSale
  }
}
