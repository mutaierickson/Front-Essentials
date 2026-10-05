import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CartItem } from '@/types'
import { stkBoxClass, stkTextClass } from '@/lib/stk'
import { CheckoutSuccess, useCheckoutController } from '@/controllers/useCheckoutController'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  total: number
  discountAmount?: number
  initialCustomerName?: string
  onSuccess: CheckoutSuccess
  userId: number
}

export function CheckoutModal({ isOpen, onClose, cart, total, discountAmount = 0, initialCustomerName = '', onSuccess, userId }: CheckoutModalProps) {
  const checkout = useCheckoutController({ isOpen, cart, total, initialCustomerName, userId, onSuccess })
  const { paymentMethod, splitRest, loading, needsPhone, stkReason, stkMessage, balance, cashDue, splitRemainder } = checkout

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Complete Checkout</DialogTitle>
          <DialogDescription className="text-slate-500">Select payment method and complete the transaction.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-600">Total Due</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">Ksh {Number(total || 0).toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <p className="text-sm text-emerald-700 -mt-4">Includes a Ksh {Number(discountAmount || 0).toFixed(2)} discount</p>
          )}

          <div className="space-y-3">
            <Label className="text-slate-700">Customer Name (Optional)</Label>
            <Input value={checkout.customerName} onChange={e => checkout.setCustomerName(e.target.value)} placeholder="Walk-in Customer" className="bg-white border-slate-200" />
          </div>

          {!needsPhone && (
            <div className="space-y-3">
              <Label className="text-slate-700">Customer phone (optional)</Label>
              <Input type="tel" inputMode="tel" placeholder="07XX XXX XXX" value={checkout.phone} onChange={e => checkout.setPhone(e.target.value)} className="bg-white border-slate-200" />
              <p className="text-xs text-slate-500">Saved for offer SMS. Required only for M-Pesa.</p>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-slate-700">Payment Method</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Cash', 'Card', 'Mobile', 'Split'] as const).map(method => (
                <Button
                  key={method}
                  type="button"
                  variant={paymentMethod === method ? 'default' : 'outline'}
                  className={`shadow-sm ${paymentMethod === method ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`}
                  onClick={() => checkout.choosePaymentMethod(method)}
                  disabled={loading}
                >
                  {method === 'Mobile' ? 'M-Pesa' : method}
                </Button>
              ))}
            </div>
          </div>

          {paymentMethod === 'Split' && (
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Cash portion (Ksh)</Label>
                <Input type="number" min="0" step="0.01" value={checkout.splitCashStr} onChange={(e) => checkout.setSplitCashStr(e.target.value)} className="bg-white border-slate-200" placeholder="0.00" />
              </div>
              <p className="text-sm text-slate-600">Remainder {splitRemainder > 0 ? `Ksh ${splitRemainder.toFixed(2)}` : '—'} via</p>
              <div className="grid grid-cols-2 gap-2">
                {(['Card', 'Mobile'] as const).map(method => (
                  <Button
                    key={method}
                    type="button"
                    variant={splitRest === method ? 'default' : 'outline'}
                    className={splitRest === method ? 'bg-slate-800 text-white' : ''}
                    onClick={() => checkout.setSplitRest(method)}
                    disabled={loading}
                  >
                    {method === 'Mobile' ? 'M-Pesa' : method}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {checkout.takesCash && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-700">Cash received (Ksh)</Label>
                <Input id="amount" type="number" step="0.01" className="text-lg h-12 bg-white border-slate-200" value={checkout.amountReceivedStr} onChange={(e) => checkout.setAmountReceivedStr(e.target.value)} placeholder="0.00" />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => checkout.setAmountReceivedStr(String(cashDue.toFixed(2)))}>Exact</Button>
                  {checkout.cashDenoms.map(value => (
                    <Button key={value} type="button" size="sm" variant="outline" onClick={() => checkout.setAmountReceivedStr(String(value))}>{value}</Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-slate-500">Change Due</span>
                <span className={`font-bold ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                  Ksh {balance > 0 ? Number(balance || 0).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          )}

          {needsPhone && (
            <div className={`space-y-3 rounded-lg border p-4 ${stkBoxClass(stkReason)}`}>
              <div className="space-y-2">
                <Label htmlFor="mpesa-phone" className="text-slate-700">Customer M-Pesa Number</Label>
                <Input id="mpesa-phone" type="tel" inputMode="tel" placeholder="07XX XXX XXX" value={checkout.phone} onChange={e => checkout.setPhone(e.target.value)} className="bg-white border-slate-200 text-lg h-12" disabled={loading} />
              </div>
              <p className="text-xs text-slate-600">An STK prompt will be sent to this number. The number is also saved for offer SMS.</p>
              {stkMessage && (
                <p className={`text-sm font-semibold ${stkTextClass(stkReason)}`}>
                  {stkReason === 'cancelled' && 'Cancelled: '}
                  {stkReason === 'insufficient_funds' && 'Insufficient funds: '}
                  {stkMessage}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading} className="text-slate-600 border-slate-200">Cancel</Button>
          <Button
            onClick={checkout.complete}
            disabled={!checkout.canComplete}
            className="w-full sm:w-auto font-bold px-8 shadow-sm bg-slate-800 text-white hover:bg-slate-700"
          >
            {checkout.waitingForMpesa ? 'Waiting for PIN...' : loading ? 'Processing...' : needsPhone ? 'Send M-Pesa Prompt' : 'Complete Sale'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
