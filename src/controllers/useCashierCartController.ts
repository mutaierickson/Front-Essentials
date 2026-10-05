import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FoodItem, CartItem } from '@/types'
import { HeldSale, createCartId, heldKey, cartSessionKey, readJson, writeJson } from '@/lib/pos'
import Swal from 'sweetalert2'

export function useCashierCartController(userId?: number) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [heldSales, setHeldSales] = useState<HeldSale[]>([])
  const [showHeld, setShowHeld] = useState(false)
  const cartRestored = useRef(false)

  useEffect(() => {
    setHeldSales(readJson<HeldSale[]>(heldKey(userId), []))
    const parsedCart = readJson<{ items?: CartItem[]; customerName?: string; discountPercent?: number } | null>(cartSessionKey(userId), null)
    if (parsedCart?.items?.length) {
      setCart(parsedCart.items)
      setCustomerName(parsedCart.customerName || '')
      setDiscountPercent(parsedCart.discountPercent || 0)
    }
    cartRestored.current = true
  }, [userId])

  const persistHeld = (next: HeldSale[]) => {
    setHeldSales(next)
    writeJson(heldKey(userId), next)
  }

  const cartQtyById = useMemo(() => {
    const map = new Map<number, number>()
    for (const item of cart) map.set(item.id, (map.get(item.id) || 0) + item.quantity)
    return map
  }, [cart])

  const addToCart = useCallback((item: FoodItem) => {
    let blocked = false
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      const inCart = existing?.quantity || 0
      if (inCart >= item.stock_quantity) {
        blocked = true
        return prev
      }
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, cart_id: createCartId(), quantity: 1 }]
    })
    if (blocked) {
      Swal.fire({ icon: 'warning', title: 'No more stock', text: `${item.name} has no remaining units.`, timer: 1400, showConfirmButton: false })
    }
  }, [])

  const updateQuantity = useCallback((cartId: string, delta: number) => {
    let blockedQty: number | null = null
    setCart(prev => prev.flatMap(item => {
      if (item.cart_id !== cartId) return [item]
      const nextQty = item.quantity + delta
      if (nextQty < 1) return []
      if (nextQty > item.stock_quantity) {
        blockedQty = item.stock_quantity
        return [item]
      }
      return [{ ...item, quantity: nextQty }]
    }))
    if (blockedQty !== null) {
      Swal.fire({ icon: 'warning', title: 'Stock limit', text: `Only ${blockedQty} units available.`, timer: 1400, showConfirmButton: false })
    }
  }, [])

  const removeFromCart = useCallback((cartId: string) => {
    setCart(prev => prev.filter(item => item.cart_id !== cartId))
  }, [])

  const setCartQuantity = async (item: CartItem) => {
    const result = await Swal.fire({
      title: item.name,
      input: 'number',
      inputValue: item.quantity,
      inputAttributes: { min: '1', max: String(item.stock_quantity), step: '1' },
      showCancelButton: true,
      confirmButtonColor: '#1e293b',
      confirmButtonText: 'Update qty'
    })
    if (result.isDismissed || result.value === undefined || result.value === '') return
    const qty = Math.floor(Number(result.value))
    if (!Number.isFinite(qty) || qty < 1) {
      removeFromCart(item.cart_id)
      return
    }
    if (qty > item.stock_quantity) {
      await Swal.fire({ icon: 'warning', title: 'Stock limit', text: `Only ${item.stock_quantity} units available.`, confirmButtonColor: '#1e293b' })
      return
    }
    setCart(prev => prev.map(row => row.cart_id === item.cart_id ? { ...row, quantity: qty } : row))
  }

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart])
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const discountAmount = subtotal * (discountPercent / 100)
  const cartTotal = Math.max(0, subtotal - discountAmount)

  useEffect(() => {
    if (!userId || !cartRestored.current) return
    writeJson(cartSessionKey(userId), { items: cart, customerName, discountPercent })
  }, [cart, customerName, discountPercent, userId])

  const resetCart = () => {
    setCart([])
    setCustomerName('')
    setDiscountPercent(0)
  }

  const holdSale = useCallback(async () => {
    if (cart.length === 0) return
    persistHeld([{ id: createCartId(), at: new Date().toISOString(), customerName, items: cart, discountPercent }, ...heldSales].slice(0, 12))
    resetCart()
    await Swal.fire({ icon: 'success', title: 'Sale parked', text: 'Recall it anytime from Held.', timer: 1200, showConfirmButton: false })
  }, [cart, customerName, discountPercent, heldSales, userId])

  const recallSale = (sale: HeldSale) => {
    if (cart.length > 0) {
      persistHeld([{ id: createCartId(), at: new Date().toISOString(), customerName, items: cart, discountPercent }, ...heldSales.filter(item => item.id !== sale.id)].slice(0, 12))
    } else {
      persistHeld(heldSales.filter(item => item.id !== sale.id))
    }
    setCart(sale.items)
    setCustomerName(sale.customerName || '')
    setDiscountPercent(sale.discountPercent || 0)
    setShowHeld(false)
  }

  const discardHeld = async (sale: HeldSale) => {
    const result = await Swal.fire({
      title: 'Discard held sale?',
      text: sale.customerName || 'Walk-in cart',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Discard'
    })
    if (result.isConfirmed) persistHeld(heldSales.filter(item => item.id !== sale.id))
  }

  const clearCart = async () => {
    if (cart.length === 0) return
    const result = await Swal.fire({ title: 'Clear this cart?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#1e293b', confirmButtonText: 'Clear' })
    if (result.isConfirmed) resetCart()
  }

  return {
    cart, setCart, customerName, setCustomerName, discountPercent, setDiscountPercent,
    heldSales, showHeld, setShowHeld, cartQtyById, addToCart, updateQuantity, removeFromCart,
    setCartQuantity, subtotal, itemCount, discountAmount, cartTotal, resetCart, holdSale,
    recallSale, discardHeld, clearCart
  }
}
