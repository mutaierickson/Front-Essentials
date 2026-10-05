import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api'
import { Category } from '@/types'

export const listCategories = (): Promise<Category[]> => apiGet('/categories')

export const createCategory = (name: string) => apiPost('/categories', { name })

export const updateCategory = (id: number, name: string) => apiPut(`/categories/${id}`, { name })

export const deleteCategory = (id: number) => apiDelete(`/categories/${id}`)
