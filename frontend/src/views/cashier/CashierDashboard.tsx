import React from 'react'
import { formatKsh } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'
import { CheckoutModal } from './CheckoutModal'
import { ReceiptModal } from './ReceiptModal'
import { CartPanel } from './CartPanel'
import { ShiftView } from './ShiftView'
import { RegisterView } from './RegisterView'
import { CashierToolbar } from './CashierToolbar'
import { ReturnExchangeModal } from './ReturnExchangeModal'
import { useCashierController } from '@/controllers/useCashierController'

export default function CashierDashboard() {
  const pos = useCashierController()

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] bg-[#f8fafc]">
      <CashierToolbar
        view={pos.view}
        onView={pos.setView}
        shiftSales={pos.stats.shift.sales}
        shiftReceipts={pos.stats.shift.transactions}
        heldCount={pos.heldSales.length}
        lastSaleId={pos.lastSaleId}
        hasLastOrder={Boolean(pos.lastOrder)}
        onLookup={() => pos.lookupReceipt()}
        onShortcuts={() => pos.setShowShortcuts(true)}
        onLastReceipt={() => pos.setIsReceiptOpen(true)}
      />

      {pos.view === 'shift' ? (
        <ShiftView
          username={pos.profile?.username}
          stats={pos.stats}
          heldSales={pos.heldSales}
          canClose={Boolean(pos.profile?.id)}
          onRefresh={pos.loadStats}
          onLookup={() => pos.lookupReceipt()}
          onOpenRegister={() => pos.setView('register')}
          onCloseDay={pos.closeDay}
          onRecall={pos.recallSale}
          onDiscard={pos.discardHeld}
          onReprint={pos.reprintOrder}
          onReturn={pos.openReturn}
          onVoid={pos.voidSale}
        />
      ) : (
        <RegisterView
          searchRef={pos.searchRef}
          searchQuery={pos.searchQuery}
          onSearchChange={pos.setSearchQuery}
          onSearchKeyDown={pos.onSearchKeyDown}
          hideOutOfStock={pos.hideOutOfStock}
          onToggleSoldOut={() => pos.setHideOutOfStock(value => !value)}
          activeCategory={pos.activeCategory}
          onCategory={pos.setActiveCategory}
          categories={pos.categories}
          loading={pos.loading}
          filteredItems={pos.filteredItems}
          cartQtyById={pos.cartQtyById}
          onAdd={pos.addToCart}
          cartProps={pos.cartProps}
        />
      )}

      {pos.view === 'register' && (
        <div className="lg:hidden shrink-0 bg-white border-t border-slate-200 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center gap-3">
          <Button type="button" variant="outline" className="flex-1 justify-between h-12 border-slate-200" onClick={() => pos.setCartOpen(true)}>
            <span className="inline-flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Cart ({pos.itemCount})</span>
            <span className="font-bold">{formatKsh(pos.cartTotal)}</span>
          </Button>
          <Button className="h-12 px-4 bg-slate-800 text-white hover:bg-slate-700" disabled={pos.cart.length === 0 || !pos.profile?.id} onClick={pos.openCheckout}>
            Pay
          </Button>
        </div>
      )}

      {pos.cartOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close cart" onClick={() => pos.setCartOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 h-[88dvh] bg-white rounded-t-2xl shadow-2xl overflow-hidden flex flex-col">
            <CartPanel {...pos.cartProps} onClose={() => pos.setCartOpen(false)} />
          </div>
        </div>
      )}

      {pos.showShortcuts && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => pos.setShowShortcuts(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-lg font-bold">Register shortcuts</h3>
              <p className="text-sm text-slate-600">F2 — focus search</p>
              <p className="text-sm text-slate-600">Scan a product barcode into search, then Enter — add to cart</p>
              <p className="text-sm text-slate-600">Scan a receipt code into search, then Enter</p>
              <p className="text-sm text-slate-600">Ctrl + Enter — checkout</p>
              <p className="text-sm text-slate-600">H — park / hold the current sale</p>
              <p className="text-sm text-slate-600">Click a cart quantity to type a number</p>
              <Button className="w-full bg-slate-800 text-white" onClick={() => pos.setShowShortcuts(false)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {pos.isCheckoutOpen && pos.profile?.id && (
        <CheckoutModal
          isOpen={pos.isCheckoutOpen}
          onClose={() => pos.setIsCheckoutOpen(false)}
          cart={pos.cart}
          total={pos.cartTotal}
          discountAmount={pos.discountAmount}
          initialCustomerName={pos.cartProps.customerName}
          onSuccess={pos.handleCheckoutSuccess}
          userId={pos.profile.id}
        />
      )}

      {pos.lastSaleId && pos.lastOrder && (
        <ReceiptModal
          isOpen={pos.isReceiptOpen}
          onClose={() => pos.setIsReceiptOpen(false)}
          saleId={pos.lastSaleId}
          order={pos.lastOrder}
          onReturn={() => pos.openReturn()}
          onVoid={() => pos.voidSale()}
        />
      )}

      {pos.isReturnOpen && pos.lastSaleId && pos.profile?.id && (
        <ReturnExchangeModal
          isOpen={pos.isReturnOpen}
          onClose={() => pos.setIsReturnOpen(false)}
          saleId={pos.lastSaleId}
          userId={pos.profile.id}
          products={pos.products}
          onSuccess={pos.handleReturnSuccess}
        />
      )}
    </div>
  )
}
