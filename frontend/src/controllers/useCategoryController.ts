import React, { useEffect, useState } from 'react'
import { Category } from '@/types'
import { createCategory, deleteCategory, listCategories, updateCategory } from '@/models/categoryModel'

export function useCategoryController() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      setCategories(await listCategories())
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    try {
      if (editingId) {
        await updateCategory(editingId, name)
        cancelEdit()
      } else {
        await createCategory(name)
        setName('')
      }
      fetchData()
    } catch (e: any) {
      console.error(e)
      alert(e.message || 'Error saving category')
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await deleteCategory(id)
      fetchData()
    } catch (e: any) {
      console.error(e)
      alert(e.message || 'Error deleting category')
    }
  }

  return { categories, loading, editingId, name, setName, startEdit, cancelEdit, submit, remove }
}
