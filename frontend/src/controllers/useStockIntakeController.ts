import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { FoodItem } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { listProducts } from '@/models/productModel'
import { createIntake, Intake, listIntakes } from '@/models/stockModel'

export function useStockIntakeController() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<FoodItem[]>([])
  const [rows, setRows] = useState<Intake[]>([])
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [catalog, intakes] = await Promise.all([listProducts(), listIntakes()])
    setProducts(catalog)
    setRows(intakes)
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  const selected = products.find((item) => String(item.id) === productId)

  const selectProduct = (id: string) => {
    setProductId(id)
    const item = products.find((row) => String(row.id) === id)
    if (item && !unitCost) setUnitCost(String(item.cost || ''))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) {
      await Swal.fire({ icon: 'error', title: 'Sign in required', confirmButtonColor: '#1e293b' })
      return
    }
    const qty = parseInt(quantity, 10)
    if (!productId || !qty || qty < 1) {
      await Swal.fire({ icon: 'warning', title: 'Enter a product and quantity', confirmButtonColor: '#1e293b' })
      return
    }
    setSaving(true)
    try {
      await createIntake({
        user_id: profile.id,
        product_id: Number(productId),
        quantity: qty,
        unit_cost: parseFloat(unitCost) || 0,
        note
      })
      setQuantity('')
      setNote('')
      await load()
      await Swal.fire({ icon: 'success', title: 'Stock received', text: `${qty} added to ${selected?.name || 'inventory'}.`, confirmButtonColor: '#1e293b', timer: 1600, showConfirmButton: false })
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Could not receive stock', text: error.message || 'Try again.', confirmButtonColor: '#1e293b' })
    } finally {
      setSaving(false)
    }
  }

  return {
    products, rows, productId, selectProduct, quantity, setQuantity,
    unitCost, setUnitCost, note, setNote, saving, submit
  }
}
