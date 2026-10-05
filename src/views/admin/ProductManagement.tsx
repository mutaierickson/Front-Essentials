import React from 'react'
import { useProductController } from '@/controllers/useProductController'
import { ProductForm } from './ProductForm'
import { ProductTable } from './ProductTable'

export default function ProductManagement() {
  const product = useProductController()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Inventory Management</h2>
      <ProductForm
        formData={product.formData}
        setFormData={product.setFormData}
        categories={product.categories}
        editingId={product.editingId}
        profitPercent={product.profitPercent}
        onSubmit={product.submit}
        onCancel={product.cancelEdit}
      />
      <ProductTable
        items={product.items}
        categories={product.categories}
        loading={product.loading}
        editingId={product.editingId}
        onEdit={product.startEdit}
        onDelete={product.remove}
      />
    </div>
  )
}
