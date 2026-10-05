import React from 'react'
import { formatKsh } from '@/lib/utils'
import { FoodItem } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Minus, Plus, Undo2 } from 'lucide-react'
import { useReturnExchangeController } from '@/controllers/useReturnExchangeController'

type Props = {
  isOpen: boolean
  onClose: () => void
  saleId: number
  userId: number
  products: FoodItem[]
  onSuccess: () => void
}

export function ReturnExchangeModal({ isOpen, onClose, saleId, userId, products, onSuccess }: Props) {
  const ret = useReturnExchangeController({ isOpen, onClose, saleId, userId, products, onSuccess })
  const { lines, qty, taken, net } = ret

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-800 flex items-center gap-2">
            <Undo2 className="w-5 h-5" /> Return or exchange
          </DialogTitle>
        </DialogHeader>

        {ret.loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Loading receipt…</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Receipt {ret.receiptCode}. Choose what comes back. Add replacements only for an exchange.</p>

            <div className="space-y-2">
              {lines.map((line) => (
                <div key={line.order_item_id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-lg p-3 bg-slate-50">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{line.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatKsh(line.price)} · {line.remaining} of {line.quantity} left to return
                      {line.size || line.color ? ` · ${[line.size, line.color].filter(Boolean).join(' ')}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={!line.remaining} onClick={() => ret.bump(line, -1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{qty[line.order_item_id] || 0}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={(qty[line.order_item_id] || 0) >= line.remaining} onClick={() => ret.bump(line, 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={ret.restock} onChange={(e) => ret.setRestock(e.target.checked)} />
              Put returned items back on the shelf
            </label>

            <div className="space-y-2">
              <Label>Exchange for (optional)</Label>
              <Input
                value={ret.search}
                onChange={(e) => ret.setSearch(e.target.value)}
                onKeyDown={ret.onSearchKeyDown}
                placeholder="Search or scan a replacement"
                className="bg-white border-slate-200"
              />
              {ret.search && (
                <div className="border border-slate-200 rounded-lg divide-y max-h-40 overflow-auto">
                  {ret.matches.length === 0 ? (
                    <p className="text-sm text-slate-500 p-3">No matching products</p>
                  ) : ret.matches.map((product) => (
                    <button key={product.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50" onClick={() => ret.pickReplacement(product)}>
                      {product.name}{product.size ? ` · ${product.size}` : ''} — {formatKsh(product.price)}
                    </button>
                  ))}
                </div>
              )}
              {taken.map((row) => (
                <div key={row.product.id} className="flex items-center justify-between text-sm">
                  <span>{row.product.name} × {row.quantity}</span>
                  <button type="button" className="text-red-600" onClick={() => ret.removeTaken(row.product.id)}>Remove</button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Refund / collect method</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['Cash', 'Card', 'Mobile'] as const).map((value) => (
                  <Button key={value} type="button" variant={ret.method === value ? 'default' : 'outline'} className={ret.method === value ? 'bg-slate-800 text-white' : ''} onClick={() => ret.setMethod(value)}>
                    {value === 'Mobile' ? 'M-Pesa' : value}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input value={ret.reason} onChange={(e) => ret.setReason(e.target.value)} placeholder="Wrong size, damaged, change of mind…" className="bg-white border-slate-200" />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="flex justify-between"><span>Coming back</span><span>{formatKsh(ret.returnedValue)}</span></div>
              <div className="flex justify-between"><span>Going out</span><span>{formatKsh(ret.exchangeValue)}</span></div>
              <div className={`flex justify-between font-semibold mt-1 ${net > 0 ? 'text-slate-800' : net < 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                <span>{net > 0 ? 'Collect' : net < 0 ? 'Refund' : 'Balance'}</span>
                <span>{formatKsh(Math.abs(net))}</span>
              </div>
            </div>

            {ret.history.length > 0 && (
              <p className="text-xs text-slate-500">
                Previous: {ret.history.map((row) => row.return_code || row.type).join(', ')}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={ret.saving} className="border-slate-200">Cancel</Button>
          <Button onClick={ret.submit} disabled={ret.saving || ret.loading || !ret.returningCount} className="bg-slate-800 text-white hover:bg-slate-700">
            {ret.saving ? 'Saving…' : taken.length ? 'Complete exchange' : 'Complete return'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
