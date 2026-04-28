'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, exportToCsv } from '@/lib/utils'

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  totalCount: number
  pageSize?: number
  currentPage?: number
  exportFilename?: string
  exportHeaders?: Record<string, string>
  isLoading?: boolean
  emptyMessage?: string
  errorMessage?: string
}

const PAGE_SIZES = [20, 50, 100]

export function DataTable<TData>({
  columns,
  data,
  totalCount,
  pageSize = 50,
  currentPage = 1,
  exportFilename,
  exportHeaders,
  isLoading,
  emptyMessage = 'אין נתונים להצגה',
  errorMessage,
}: DataTableProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalCount / pageSize),
  })

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, value)
      if (key !== 'page') params.set('page', '1')
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  function handleSort(columnId: string) {
    const currentSort = searchParams.get('sort')
    const currentOrder = searchParams.get('order')
    const params = new URLSearchParams(searchParams.toString())

    if (currentSort === columnId) {
      if (currentOrder === 'asc') {
        params.set('order', 'desc')
      } else if (currentOrder === 'desc') {
        params.delete('sort')
        params.delete('order')
      } else {
        params.set('sort', columnId)
        params.set('order', 'asc')
      }
    } else {
      params.set('sort', columnId)
      params.set('order', 'asc')
    }
    params.set('page', '1')
    router.replace(`${pathname}?${params.toString()}`)
  }

  function getSortIcon(columnId: string) {
    const currentSort = searchParams.get('sort')
    const currentOrder = searchParams.get('order')
    if (currentSort !== columnId) return <ArrowUpDown className="h-3 w-3 ms-1 opacity-50" />
    if (currentOrder === 'asc') return <ArrowUp className="h-3 w-3 ms-1" />
    return <ArrowDown className="h-3 w-3 ms-1" />
  }

  const totalPages = Math.ceil(totalCount / pageSize)
  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalCount)

  function handleExport() {
    if (!exportFilename || !exportHeaders) return
    const today = new Date().toISOString().slice(0, 10)
    exportToCsv(
      `${exportFilename}-${today}.csv`,
      exportHeaders,
      data as Record<string, unknown>[]
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">שורות לעמוד:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => updateParam('pageSize', v)}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {exportFilename && exportHeaders && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            ייצוא CSV
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'h-12 px-4 text-start align-middle font-medium text-muted-foreground whitespace-nowrap',
                      (header.column.columnDef.meta as { sortable?: boolean } | undefined)?.sortable &&
                        'cursor-pointer hover:text-foreground select-none'
                    )}
                    onClick={() => {
                      if ((header.column.columnDef.meta as { sortable?: boolean } | undefined)?.sortable) {
                        handleSort(header.column.id)
                      }
                    }}
                  >
                    <div className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {(header.column.columnDef.meta as { sortable?: boolean } | undefined)?.sortable &&
                        getSortIcon(header.column.id)}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b hover:bg-muted/30 transition-colors',
                    (row.original as { _error?: boolean })?._error && 'bg-red-50'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount > 0 ? `מציג ${from}–${to} מתוך ${totalCount.toLocaleString('he-IL')} רשומות` : 'אין רשומות'}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
            onClick={() => updateParam('page', '1')}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
            onClick={() => updateParam('page', String(currentPage - 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2">
            עמוד {currentPage} מתוך {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
            onClick={() => updateParam('page', String(currentPage + 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
            onClick={() => updateParam('page', String(totalPages))}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
