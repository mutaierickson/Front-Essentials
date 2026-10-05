import React from 'react'
import { formatKsh, formatTimestamp } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStockIntakeController } from '@/controllers/useStockIntakeController'

export default function StockIntake() {
  const {
    products, rows, productId, selectProduct, quantity, setQuantity,
    unitCost, setUnitCost, note, setNote, saving, submit
  } = useStockIntakeController()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Receive stock</h2>
        <p className="text-slate-500 mt-1">Add incoming units to a product. Optional buying cost updates the inventory cost.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>New intake</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-2 lg:col-span-2">
              <Label>Product</Label>
              <select
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
                value={productId}
                onChange={(e) => selectProduct(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}{item.size ? ` · ${item.size}` : ''}{item.color ? ` · ${item.color}` : ''} ({item.stock_quantity} in stock)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-white border-slate-200" required />
            </div>
            <div className="space-y-2">
              <Label>Buying cost (optional)</Label>
              <Input type="number" min="0" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className="bg-white border-slate-200" />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label>Note</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Supplier, carton, invoice no." className="bg-white border-slate-200" />
            </div>
            <Button type="submit" disabled={saving} className="bg-slate-800 text-white hover:bg-slate-700">
              {saving ? 'Saving...' : 'Receive stock'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Recent intakes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">No stock received yet.</p>
          ) : rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 text-sm border-b border-slate-100 pb-2 last:border-0">
              <div>
                <p className="font-medium">{row.name || 'Product'}{row.size ? ` · ${row.size}` : ''}</p>
                <p className="text-xs text-slate-500">{row.username || 'Staff'} · {formatTimestamp(row.created_at)}{row.note ? ` · ${row.note}` : ''}</p>
              </div>
              <span className="font-semibold">+{row.quantity}{row.unit_cost ? ` · ${formatKsh(row.unit_cost)}` : ''}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
