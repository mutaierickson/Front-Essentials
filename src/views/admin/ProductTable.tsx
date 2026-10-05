import { Category, FoodItem } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Edit2 } from 'lucide-react'
import { formatProfitPercent, profitPercentFromSelling, profitTone } from '@/lib/profit'

export function ProductTable({
  items,
  categories,
  loading,
  editingId,
  onEdit,
  onDelete
}: {
  items: FoodItem[]
  categories: Category[]
  loading: boolean
  editingId: number | null
  onEdit: (item: FoodItem) => void
  onDelete: (id: number) => void
}) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size / Color</TableHead>
              <TableHead>Buying</TableHead>
              <TableHead>Selling</TableHead>
              <TableHead>Profit %</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8">No items found.</TableCell></TableRow>
            ) : items.map((item) => {
              const itemProfit = profitPercentFromSelling(Number(item.price || 0), Number(item.cost || 0))
              return (
                <TableRow key={item.id} className={editingId === item.id ? 'bg-slate-50' : ''}>
                  <TableCell className="font-medium text-slate-800">{item.name}</TableCell>
                  <TableCell>{categories.find(c => c.id === item.category_id)?.name}</TableCell>
                  <TableCell>
                    {item.size && <span className="bg-slate-100 px-1 py-0.5 rounded text-xs mr-1">{item.size}</span>}
                    {item.color && <span className="bg-slate-100 px-1 py-0.5 rounded text-xs">{item.color}</span>}
                  </TableCell>
                  <TableCell className="text-slate-600">Ksh {Number(item.cost || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-slate-800 font-medium">Ksh {Number(item.price || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${profitTone(itemProfit)}`}>
                      {formatProfitPercent(itemProfit)}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">{item.barcode || '—'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${item.stock_quantity <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50" onClick={() => onEdit(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => onDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
