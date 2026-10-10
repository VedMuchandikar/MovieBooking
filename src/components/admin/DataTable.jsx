import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

/**
 * columns: [{ key, header, cell?: (row) => node, className? }]. Client-side pagination.
 */
export function DataTable({ columns, rows, onRowClick, pageSize = 10, empty = 'Nothing to show yet.', rowKey = (r) => r.id }) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  useEffect(() => setPage((p) => Math.min(p, pages - 1)), [pages])
  const slice = rows.slice(page * pageSize, page * pageSize + pageSize)

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              {columns.map((c) => (
                <TableHead key={c.key} className={cn('label-caps h-11 whitespace-nowrap px-4', c.className)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('border-white/5 transition-colors', onRowClick && 'cursor-pointer hover:bg-gold/[0.04]')}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn('px-4 py-3', c.className)}>
                    {c.cell ? c.cell(row) : row[c.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {rows.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-14 text-sm text-muted-foreground">
          <Inbox className="size-6 text-gold/50" />
          {empty}
        </div>
      )}

      {rows.length > pageSize && (
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-xs text-muted-foreground">
          <span>
            {page * pageSize + 1}–{Math.min(rows.length, (page + 1) * pageSize)} of {rows.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 tabular-nums">{page + 1} / {pages}</span>
            <Button variant="ghost" size="icon" className="size-8" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} aria-label="Next page">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
