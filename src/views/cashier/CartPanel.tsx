import React from 'react'
import { CartItem } from '@/types'
import { HeldSale } from '@/lib/pos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Minus, Pause, Play, Plus, Receipt, ShoppingCart, Trash2, Percent, X } from 'lucide-react'
import { formatKsh } from '@/lib/utils'

export type CartPanelProps = {
  itemCount: number
  cart: CartItem[]
  customerName: string
  setCustomerName: (value: string) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  setCartQuantity: (item: CartItem) => void
  discountPercent: number
  setDiscountPercent: (value: number) => void
  subtotal: number
  discountAmount: number
  cartTotal: number
  holdSale: () => void
  clearCart: () => void
  heldSales: HeldSale[]
  showHeld: boolean
  setShowHeld: React.Dispatch<React.SetStateAction<boolean>>
  recallSale: (sale: HeldSale) => void
  discardHeld: (sale: HeldSale) => void
  canCheckout: boolean
  onCheckout: () => void
  onClose?: () => void
}

export function CartPanel(props: CartPanelProps) {
  const {
    itemCount, cart, customerName, setCustomerName, removeFromCart, updateQuantity, setCartQuantity,
    discountPercent, setDiscountPercent, subtotal, discountAmount, cartTotal, holdSale, clearCart,
    heldSales, showHeld, setShowHeld, recallSale, discardHeld, canCheckout, onCheckout, onClose
  } = props

  return (
    <div className="bg-white flex flex-col h-full min-h-0">
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-slate-800">
            <Receipt className="w-5 h-5 text-slate-500" />
            Current Order
          </h2>
          <p className="text-xs text-slate-500 mt-1">{itemCount} item{itemCount === 1 ? '' : 's'}</p>
        </div>
        {onClose && (
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close cart">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="px-4 pt-3">
        <Input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer name (optional)"
          className="bg-white border-slate-200"
        />
      </div>

      <ScrollArea className="flex-1 p-4 min-h-0">
        {cart.length === 0 ? (
          <div className="h-full min-h-[8rem] flex flex-col items-center justify-center text-slate-400 space-y-4">
            <ShoppingCart className="w-12 h-12 opacity-20" />
            <p>Cart is empty</p>
            <p className="text-xs text-center px-4">Tap a product or scan a barcode. On desktop: F2 search · Ctrl+Enter checkout</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.cart_id} className="flex gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-800 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-slate-500">
                    {item.size ? `Size: ${item.size} ` : ''}
                    {item.color ? `Color: ${item.color}` : ''}
                  </p>
                  <p className="text-slate-600 font-medium text-sm mt-1">{formatKsh(item.price * item.quantity)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeFromCart(item.cart_id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2 bg-white rounded-md border border-slate-200 shadow-sm mt-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none rounded-l-md text-slate-600" onClick={() => updateQuantity(item.cart_id, -1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span
                      className="text-sm font-medium w-6 text-center text-slate-800 cursor-pointer"
                      title="Click to type quantity"
                      onClick={() => setCartQuantity(item)}
                    >
                      {item.quantity}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none rounded-r-md text-slate-600" onClick={() => updateQuantity(item.cart_id, 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 sm:p-5 bg-white border-t border-slate-200 mt-auto space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-500 flex items-center gap-1"><Percent className="w-3 h-3" /> Discount</span>
          <div className="flex gap-1">
            {[0, 5, 10].map(value => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={discountPercent === value ? 'default' : 'outline'}
                className={discountPercent === value ? 'bg-slate-800 text-white h-7 px-2' : 'h-7 px-2 text-slate-600'}
                onClick={() => setDiscountPercent(value)}
              >
                {value}%
              </Button>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Subtotal</span>
          <span>{formatKsh(subtotal)}</span>
        </div>
        {discountPercent > 0 && (
          <div className="flex justify-between text-sm text-emerald-700">
            <span>Discount {discountPercent}%</span>
            <span>- {formatKsh(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-lg">
          <span className="font-medium text-slate-500">Total</span>
          <span className="font-bold text-xl sm:text-2xl text-slate-800">{formatKsh(cartTotal)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="border-slate-200" disabled={cart.length === 0} onClick={holdSale}>
            <Pause className="w-4 h-4 mr-2" /> Hold
          </Button>
          <Button variant="outline" className="border-slate-200" disabled={cart.length === 0} onClick={clearCart}>
            <Trash2 className="w-4 h-4 mr-2" /> Clear
          </Button>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            className="w-full border-slate-200"
            disabled={heldSales.length === 0}
            onClick={() => setShowHeld(value => !value)}
          >
            <Play className="w-4 h-4 mr-2" /> Recall held ({heldSales.length})
          </Button>
          {showHeld && heldSales.length > 0 && (
            <div className="absolute bottom-12 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 space-y-1 z-20">
              {heldSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-slate-50">
                  <button className="text-left text-sm flex-1" onClick={() => recallSale(sale)}>
                    <span className="font-medium">{sale.customerName || 'Walk-in'}</span>
                    <span className="text-slate-500 ml-2">{sale.items.length} items</span>
                  </button>
                  <button className="text-xs text-red-500" onClick={() => discardHeld(sale)}>Discard</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button
          className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-slate-800 hover:bg-slate-700 text-white"
          size="lg"
          disabled={cart.length === 0 || !canCheckout}
          onClick={onCheckout}
        >
          Checkout {formatKsh(cartTotal)}
        </Button>
      </div>
    </div>
  )
}
