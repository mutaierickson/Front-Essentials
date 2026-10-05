import type { FormEvent } from 'react'
import { Category } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { formatProfitPercent } from '@/lib/profit'
import type { ProductFormData } from '@/controllers/useProductController'

export function ProductForm({
  formData,
  setFormData,
  categories,
  editingId,
  profitPercent,
  onSubmit,
  onCancel
}: {
  formData: ProductFormData
  setFormData: (next: ProductFormData) => void
  categories: Category[]
  editingId: number | null
  profitPercent: number | null
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
}) {
  const update = (key: keyof ProductFormData, value: string) => setFormData({ ...formData, [key]: value })
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
        {editingId && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-500">
            <X className="w-4 h-4 mr-2" /> Cancel Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 items-end">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={formData.name} onChange={e => update('name', e.target.value)} className="bg-white border-slate-200" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                value={formData.category_id}
                onChange={e => update('category_id', e.target.value)}
                required
              >
                <option value="" disabled>Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input id="size" placeholder="M, L, 9, etc." value={formData.size} onChange={e => update('size', e.target.value)} className="bg-white border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" placeholder="Black" value={formData.color} onChange={e => update('color', e.target.value)} className="bg-white border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode / SKU</Label>
              <Input id="barcode" placeholder="Scan or type" value={formData.barcode} onChange={e => update('barcode', e.target.value)} className="bg-white border-slate-200 font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Qty</Label>
              <Input id="stock" type="number" value={formData.stock_quantity} onChange={e => update('stock_quantity', e.target.value)} className="bg-white border-slate-200" required />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Pricing</h3>
              <p className="text-xs text-slate-500">Profit % is calculated from selling price: (selling − buying) ÷ selling.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3 items-end">
              <div className="space-y-2">
                <Label htmlFor="cost">Buying Price (Ksh)</Label>
                <Input id="cost" type="number" min="0" step="0.01" value={formData.cost} onChange={e => update('cost', e.target.value)} className="bg-white border-slate-200" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (Ksh)</Label>
                <Input id="price" type="number" min="0" step="0.01" value={formData.price} onChange={e => update('price', e.target.value)} className="bg-white border-slate-200" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profit">Profit %</Label>
                <div
                  id="profit"
                  className={`flex h-9 w-full items-center rounded-md border px-3 text-sm font-semibold ${
                    profitPercent === null
                      ? 'border-slate-200 bg-white text-slate-400'
                      : profitPercent >= 0
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {formatProfitPercent(profitPercent)}
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="shadow-sm bg-slate-800 text-white hover:bg-slate-700 w-full">
            {editingId ? 'Update Product' : 'Add Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
