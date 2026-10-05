import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatKsh, formatTimestamp } from '@/lib/utils'
import { makeReceiptCode } from '@/lib/receiptCode'
import { ReceiptScanCode } from '@/components/ReceiptScanCode'
import { splitInclusive } from '@/lib/vat'
import type { ReceiptOrder } from '@/models/receiptModel'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  saleId: number
  order: ReceiptOrder
  onReturn?: () => void
  onVoid?: () => void
}

const methodLabel = (method?: string | null) => {
  if (!method) return null
  return method === 'Mobile' ? 'M-Pesa' : method
}

export function ReceiptModal({ isOpen, onClose, saleId, order, onReturn, onVoid }: ReceiptModalProps) {
  const receiptCode = order.receiptCode || makeReceiptCode(saleId)
  const vat = splitInclusive(order.total, order.vatRate || 16)
  const vatAmount = order.vatAmount != null ? Number(order.vatAmount) : vat.vat_amount
  const net = Math.round((Number(order.total || 0) - vatAmount) * 100) / 100
  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] w-full bg-white border-slate-200 shadow-lg print:shadow-none print:w-full print:max-w-full">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-slate-800">Sale Complete</DialogTitle>
        </DialogHeader>

        <div className="bg-white text-slate-800 p-4 sm:p-6 font-mono text-sm shadow-sm border border-slate-200 rounded-lg" id="receipt-content">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Essentials by ED" className="w-40 sm:w-64 h-auto grayscale object-contain" />
            </div>
            <h2 className="text-2xl font-bold mb-1 text-slate-800">Essentials</h2>
            <p className="text-xs text-slate-500">Sales Receipt{order.voided ? ' · VOIDED' : ''}</p>
          </div>
          
          <div className="mb-6 border-b border-dashed border-slate-300 pb-4 text-center">
            <p className="text-lg font-bold text-slate-700">Receipt {receiptCode}</p>
            <p className="text-xs text-slate-500">Order #{saleId}</p>
            <p className="text-xs text-slate-500">{formatTimestamp(order.createdAt) !== '—' ? formatTimestamp(order.createdAt) : new Date().toLocaleString()}</p>
            {order.customerName && <p className="text-xs text-slate-500 mt-1">{order.customerName}</p>}
            {methodLabel(order.method) && <p className="text-xs text-slate-500">{methodLabel(order.method)}</p>}
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-xs font-bold border-b border-slate-200 pb-2">
              <span>ITEM</span>
              <span>TOTAL</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} x {formatKsh(item.price)}
                    {item.size || item.color ? ` · ${[item.size, item.color].filter(Boolean).join(' ')}` : ''}
                  </p>
                </div>
                <div className="font-medium text-right">
                  {formatKsh(item.quantity * item.price)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Taxable (ex VAT)</span>
              <span>{formatKsh(net)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>VAT {order.vatRate || 16}%</span>
              <span>{formatKsh(vatAmount)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg">
              <span>{order.voided ? 'VOIDED' : 'TOTAL'}</span>
              <span>{formatKsh(order.total)}</span>
            </div>
            {(order.payments || []).length > 1 && order.payments!.map((pay, idx) => (
              <div key={`${pay.method}-${idx}`} className="flex justify-between text-xs text-slate-500">
                <span>{pay.method === 'Mobile' ? 'M-Pesa' : pay.method}</span>
                <span>{formatKsh(pay.amount)}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 text-xs text-slate-500">
            <p>Thank you for shopping with us!</p>
            <p className="mt-2">Please retain your receipt for returns or exchanges.</p>
          </div>
          <ReceiptScanCode code={receiptCode} />
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-600">Close</Button>
          {onReturn && !order.voided && (
            <Button variant="outline" onClick={onReturn} className="border-slate-200 text-slate-700">
              Return / Exchange
            </Button>
          )}
          {onVoid && !order.voided && (
            <Button variant="outline" onClick={onVoid} className="border-red-200 text-red-700">
              Void sale
            </Button>
          )}
          <Button onClick={handlePrint} className="font-bold shadow-sm bg-slate-800 text-white hover:bg-slate-700">
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
