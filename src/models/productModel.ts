import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api'
import { FoodItem } from '@/types'

export type ProductInput = {
  name: string
  category_id: string
  price: number
  cost: number
  stock_quantity: number
  size: string | null
  color: string | null
  barcode: string | null
}

export const listProducts = (): Promise<FoodItem[]> => apiGet('/products')

export const createProduct = (product: ProductInput) => apiPost('/products', product)

export const updateProduct = (id: number, product: ProductInput) => apiPut(`/products/${id}`, product)

export const deleteProduct = (id: number) => apiDelete(`/products/${id}`)
