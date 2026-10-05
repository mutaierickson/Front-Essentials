import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserPlus, Trash2 } from 'lucide-react'
import type { Customer as SmsCustomer } from '@/models/customerModel'

export function SmsAddCustomerCard({
  newName, onNewName, newPhone, onNewPhone, onAdd
}: {
  newName: string
  onNewName: (value: string) => void
  newPhone: string
  onNewPhone: (value: string) => void
  onAdd: (e: React.FormEvent) => void
}) {
  return (
    <Card className="lg:col-span-2 border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Add customer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onAdd} className="space-y-3">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={newName} onChange={e => onNewName(e.target.value)} placeholder="Optional" className="bg-white border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={newPhone} onChange={e => onNewPhone(e.target.value)} placeholder="07XX XXX XXX" className="bg-white border-slate-200" required />
          </div>
          <Button type="submit" variant="outline" className="w-full border-slate-200">
            <UserPlus className="w-4 h-4 mr-2" /> Save number
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function SmsCustomerTable({
  loading, customers, sendAll, selected, onToggle, onRemove
}: {
  loading: boolean
  customers: SmsCustomer[]
  sendAll: boolean
  selected: number[]
  onToggle: (id: number) => void
  onRemove: (customer: SmsCustomer) => void
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Customer numbers</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Loading...</TableCell></TableRow>
            ) : customers.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">No numbers yet. Add one here or capture it at checkout.</TableCell></TableRow>
            ) : customers.map(customer => (
              <TableRow key={customer.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={sendAll || selected.includes(customer.id)}
                    onChange={() => onToggle(customer.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{customer.name || 'Customer'}</TableCell>
                <TableCell className="font-mono text-sm">{customer.phone}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onRemove(customer)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
