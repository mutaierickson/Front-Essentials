import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Edit2, X } from 'lucide-react'
import { useCategoryController } from '@/controllers/useCategoryController'

export default function CategoryManagement() {
  const {
    categories, loading, editingId, name, setName,
    startEdit: handleEditClick, cancelEdit: handleCancelEdit, submit: handleSubmit, remove: handleDelete
  } = useCategoryController()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Category Management</h2>
      
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{editingId ? 'Edit Category' : 'Add New Category'}</CardTitle>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-slate-500">
              <X className="w-4 h-4 mr-2" /> Cancel Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jeans, Hats" className="bg-white border-slate-200" required />
            </div>
            <Button type="submit" className="shadow-sm bg-slate-800 text-white hover:bg-slate-700 w-32">
              {editingId ? 'Update' : 'Add'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">No categories found.</TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} className={editingId === category.id ? 'bg-slate-50' : ''}>
                    <TableCell className="font-medium text-slate-800">{category.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(category)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
