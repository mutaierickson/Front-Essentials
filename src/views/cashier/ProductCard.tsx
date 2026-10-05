import React from 'react'
import { FoodItem } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { formatKsh } from '@/lib/utils'

export const ProductCard = React.memo(function ProductCard({
  item,
  inCart,
  onAdd
}: {
  item: FoodItem
  inCart: number
  onAdd: (item: FoodItem) => void
}) {
  const remaining = item.stock_quantity - inCart
  const low = remaining > 0 && remaining <= (item.min_stock_level || 5)
  const out = remaining <= 0

  return (
    <Card
      className={`transition-shadow border-slate-200 shadow-sm overflow-hidden flex flex-col bg-white ${
        out ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
      }`}
      onClick={() => !out && onAdd(item)}
    >
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-slate-800 line-clamp-2">{item.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.size && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">{item.size}</span>}
            {item.color && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">{item.color}</span>}
            {item.barcode && <span className="font-mono text-[10px] text-slate-400">{item.barcode}</span>}
          </div>
          <p className={`text-xs mt-2 font-medium ${out ? 'text-red-600' : low ? 'text-amber-600' : 'text-slate-500'}`}>
            {out ? 'Out of stock' : low ? `Low · ${remaining} left` : `Stock: ${remaining}`}
          </p>
        </div>
        <p className="font-bold text-sm sm:text-base text-slate-800 mt-2">{formatKsh(item.price)}</p>
      </CardContent>
    </Card>
  )
})
