import React, { useEffect, useState } from 'react'
import { Category, FoodItem } from '@/types'
import { profitPercentFromSelling } from '@/lib/profit'
import { listCategories } from '@/models/categoryModel'
import { createProduct, deleteProduct, listProducts, updateProduct } from '@/models/productModel'

export type ProductFormData = {
  name: string
  category_id: string
  price: string
  cost: string
  stock_quantity: string
  size: string
  color: string
  barcode: string
}

const emptyProductForm: ProductFormData = {
  name: '',
  category_id: '',
  price: '',
  cost: '',
  stock_quantity: '',
  size: '',
  color: '',
  barcode: ''
}

export function useProductController() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyProductForm)
  const profitPercent = profitPercentFromSelling(parseFloat(formData.price), parseFloat(formData.cost))

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cats, foods] = await Promise.all([listCategories(), listProducts()])
      setCategories(cats)
      setItems(foods)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const cancelEdit = () => {
    setEditingId(null)
    setFormData(emptyProductForm)
  }

  const startEdit = (item: FoodItem) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      category_id: item.category_id.toString(),
      price: item.price.toString(),
      cost: Number(item.cost || 0).toString(),
      stock_quantity: item.stock_quantity.toString(),
      size: item.size || '',
      color: item.color || '',
      barcode: item.barcode || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category_id || !formData.price || !formData.cost || !formData.stock_quantity) return
    const payload = {
      name: formData.name,
      category_id: formData.category_id,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock_quantity: parseInt(formData.stock_quantity, 10),
      size: formData.size || null,
      color: formData.color || null,
      barcode: formData.barcode || null,
    }
    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        cancelEdit()
      } else {
        await createProduct(payload)
        setFormData(emptyProductForm)
      }
      fetchData()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error saving product')
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      await deleteProduct(id)
      fetchData()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error deleting item')
    }
  }

  return { items, categories, loading, editingId, formData, setFormData, profitPercent, startEdit, cancelEdit, submit, remove }
}
