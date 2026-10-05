import { ReactNode } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Column<T> = {
  key: string
  header: string
  className?: string
  render: (row: T) => ReactNode
}

export function ReportTable<T>({
  columns,
  rows,
  empty,
  colSpan
}: {
  columns: Column<T>[]
  rows: T[]
  empty: string
  colSpan?: number
}) {
  return (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          {columns.map(col => (
            <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colSpan || columns.length} className="text-center py-4">{empty}</TableCell>
          </TableRow>
        ) : rows.map((row, i) => (
          <TableRow key={i}>
            {columns.map(col => (
              <TableCell key={col.key} className={col.className}>{col.render(row)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
