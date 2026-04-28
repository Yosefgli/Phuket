'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { PhoneCell } from '@/components/phone-cell'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Donation } from '@/lib/database.types'

interface Props {
  data: Donation[]
  totalCount: number
  page: number
  pageSize: number
  filters: Record<string, string | undefined>
}

const CSV_HEADERS: Record<string, string> = {
  full_name: 'שם מלא',
  phone: 'טלפון',
  email: 'אימייל',
  amount: 'סכום',
  currency: 'מטבע',
  product_name: 'מוצר',
  terminal_name: 'טרמינל',
  payment_id: 'Payment ID',
  payment_date: 'תאריך תשלום',
  donor_note: 'הערת תורם',
  recurring: 'חוזר',
}

const columns: ColumnDef<Donation>[] = [
  {
    accessorKey: 'full_name',
    header: 'שם מלא',
    cell: ({ getValue }) => <span className="font-medium">{(getValue() as string) ?? '—'}</span>,
    meta: { sortable: true },
  },
  {
    accessorKey: 'phone',
    header: 'טלפון',
    cell: ({ getValue }) => <PhoneCell phone={getValue() as string} />,
  },
  {
    accessorKey: 'email',
    header: 'אימייל',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">{(getValue() as string) ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'סכום',
    cell: ({ getValue, row }) => (
      <span className="font-bold text-green-700">
        {formatCurrency(getValue() as number)}
        {row.original.currency && row.original.currency !== 'ILS' && (
          <span className="text-xs text-muted-foreground ms-1">({row.original.currency})</span>
        )}
      </span>
    ),
    meta: { sortable: true },
  },
  {
    accessorKey: 'product_name',
    header: 'מוצר',
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{(getValue() as string) ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'terminal_name',
    header: 'טרמינל',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">{(getValue() as string) ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'payment_id',
    header: 'Payment ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">{(getValue() as string) ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'payment_date',
    header: 'תאריך תשלום',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">{formatDateTime(getValue() as string)}</span>
    ),
    meta: { sortable: true },
  },
  {
    accessorKey: 'recurring',
    header: 'חוזר',
    cell: ({ getValue }) =>
      getValue() ? <Badge variant="secondary">חוזר</Badge> : <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: 'donor_note',
    header: 'הערה',
    cell: ({ getValue }) => {
      const note = getValue() as string
      return note ? (
        <span className="text-xs text-muted-foreground max-w-[12rem] truncate block" title={note}>
          {note}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
  },
]

export function DonationsClient({ data, totalCount, page, pageSize, filters }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      if (key !== 'page') params.set('page', '1')
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-md border p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">חיפוש</Label>
            <Input
              placeholder="שם / טלפון / אימייל / Payment ID"
              defaultValue={filters.search}
              onChange={(e) => {
                const val = e.target.value
                setTimeout(() => updateParam('search', val), 300)
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">מוצר</Label>
            <Input
              placeholder="שם מוצר..."
              defaultValue={filters.product}
              onChange={(e) => setTimeout(() => updateParam('product', e.target.value), 300)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">טרמינל</Label>
            <Input
              placeholder="שם טרמינל..."
              defaultValue={filters.terminal}
              onChange={(e) => setTimeout(() => updateParam('terminal', e.target.value), 300)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">סכום מינימום (₪)</Label>
            <Input
              type="number"
              placeholder="0"
              defaultValue={filters.minAmount}
              onChange={(e) => setTimeout(() => updateParam('minAmount', e.target.value), 300)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">סכום מקסימום (₪)</Label>
            <Input
              type="number"
              placeholder="ללא הגבלה"
              defaultValue={filters.maxAmount}
              onChange={(e) => setTimeout(() => updateParam('maxAmount', e.target.value), 300)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">מתאריך</Label>
            <Input
              type="date"
              defaultValue={filters.from}
              onChange={(e) => updateParam('from', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">עד תאריך</Label>
            <Input
              type="date"
              defaultValue={filters.to}
              onChange={(e) => updateParam('to', e.target.value)}
            />
          </div>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => router.replace(pathname)}>
            נקה פילטרים
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data}
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={page}
        exportFilename="donations"
        exportHeaders={CSV_HEADERS}
      />
    </div>
  )
}
