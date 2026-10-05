import { RefObject } from 'react'
import { Category, FoodItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Eye, EyeOff, Search } from 'lucide-react'
import { chipClass } from '@/lib/pos'
import { ProductCard } from './ProductCard'
import { CartPanel, CartPanelProps } from './CartPanel'

type Props = {
  searchRef: RefObject<HTMLInputElement | null>
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  hideOutOfStock: boolean
  onToggleSoldOut: () => void
  activeCategory: number | null
  onCategory: (id: number | null) => void
  categories: Category[]
  loading: boolean
  filteredItems: FoodItem[]
  cartQtyById: Map<number, number>
  onAdd: (item: FoodItem) => void
  cartProps: CartPanelProps
}

export function RegisterView({
  searchRef, searchQuery, onSearchChange, onSearchKeyDown, hideOutOfStock, onToggleSoldOut,
  activeCategory, onCategory, categories, loading, filteredItems, cartQtyById, onAdd, cartProps
}: Props) {
  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-hidden min-w-0">
        <div className="flex flex-col mb-3 sm:mb-6 gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              ref={searchRef}
              placeholder="Search, scan a product, or scan a receipt"
              className="pl-10 h-11 sm:h-12 bg-white border-0 shadow-sm rounded-lg text-base sm:text-lg"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap -mx-3 px-3 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none' }}>
            <Button variant={hideOutOfStock ? 'default' : 'outline'} className={chipClass(hideOutOfStock)} onClick={onToggleSoldOut}>
              {hideOutOfStock ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              <span className="hidden sm:inline">{hideOutOfStock ? 'Hiding sold out' : 'Hide sold out'}</span>
              <span className="sm:hidden">{hideOutOfStock ? 'In stock' : 'Sold out'}</span>
            </Button>
            <Button variant={activeCategory === null ? 'default' : 'outline'} className={chipClass(activeCategory === null)} onClick={() => onCategory(null)}>
              All Items
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                className={chipClass(activeCategory === cat.id)}
                onClick={() => onCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 -mx-3 px-3 sm:-mx-6 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400">No matching products</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4 pb-24 lg:pb-6">
              {filteredItems.map(item => (
                <ProductCard
                  key={item.id}
                  item={item}
                  inCart={cartQtyById.get(item.id) || 0}
                  onAdd={onAdd}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="hidden lg:flex w-[360px] xl:w-[400px] shrink-0 bg-white border-l border-slate-200 shadow-xl flex-col relative z-10 h-full min-h-0">
        <CartPanel {...cartProps} />
      </div>
    </div>
  )
}
