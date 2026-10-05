import { formatKsh } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileSearch, Keyboard, RotateCcw } from 'lucide-react'

type Props = {
  view: 'register' | 'shift'
  onView: (view: 'register' | 'shift') => void
  shiftSales: number
  shiftReceipts: number
  heldCount: number
  lastSaleId: number | null
  hasLastOrder: boolean
  onLookup: () => void
  onShortcuts: () => void
  onLastReceipt: () => void
}

export function CashierToolbar({
  view, onView, shiftSales, shiftReceipts, heldCount, lastSaleId, hasLastOrder,
  onLookup, onShortcuts, onLastReceipt
}: Props) {
  return (
    <div className="px-3 sm:px-6 py-2 sm:py-3 bg-white border-b border-slate-200 flex flex-wrap items-center gap-2 sm:gap-3">
      <div className="flex bg-slate-100 rounded-lg p-1">
        <Button size="sm" variant={view === 'register' ? 'default' : 'ghost'} className={view === 'register' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-slate-600'} onClick={() => onView('register')}>
          Register
        </Button>
        <Button size="sm" variant={view === 'shift' ? 'default' : 'ghost'} className={view === 'shift' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-slate-600'} onClick={() => onView('shift')}>
          My Shift
        </Button>
      </div>
      <div className="hidden sm:flex gap-4 text-sm">
        <div><p className="text-xs text-slate-400">My sales</p><p className="font-semibold text-slate-800">{formatKsh(shiftSales)}</p></div>
        <div><p className="text-xs text-slate-400">Receipts</p><p className="font-semibold text-slate-800">{shiftReceipts}</p></div>
        <div><p className="text-xs text-slate-400">Held</p><p className="font-semibold text-slate-800">{heldCount}</p></div>
      </div>
      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm" className="border-slate-200" onClick={onLookup}>
          <FileSearch className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Find receipt</span>
        </Button>
        <Button variant="outline" size="sm" className="border-slate-200 hidden sm:inline-flex" onClick={onShortcuts}>
          <Keyboard className="w-4 h-4 mr-2" /> Shortcuts
        </Button>
        {hasLastOrder && lastSaleId && (
          <Button variant="outline" size="sm" className="border-slate-200" onClick={onLastReceipt}>
            <RotateCcw className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Last receipt</span>
          </Button>
        )}
      </div>
    </div>
  )
}
