'use client'

import { useCallback, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatDateTime } from '@/lib/utils'
import type { Json, IncomingPayload } from '@/lib/database.types'

type PayloadRow = IncomingPayload & { _error: boolean }

interface Props {
  data: PayloadRow[]
  totalCount: number
  page: number
  pageSize: number
  distinctTypes: string[]
  filters: Record<string, string | undefined>
}

function PayloadViewer({ payload }: { payload: Json | null }) {
  if (payload === null || payload === undefined) {
    return <p className="text-muted-foreground text-sm">אין נתוני payload</p>
  }
  return (
    <pre className="bg-slate-50 border rounded-md p-4 text-xs font-mono overflow-auto max-h-96 text-start">
      {JSON.stringify(payload, null, 2)}
    </pre>
  )
}

const columns: ColumnDef<PayloadRow>[] = [
  {
    accessorKey: 'created_at',
    header: 'תאריך',
    cell: ({ getValue }) => (
      <span className="text-xs">{formatDateTime(getValue() as string)}</span>
    ),
    meta: { sortable: true },
  },
  {
    accessorKey: 'payload_type',
    header: 'סוג',
    cell: ({ getValue }) => (
      <Badge variant="outline" className="text-xs">
        {(getValue() as string) ?? '—'}
      </Badge>
    ),
  },
  {
    accessorKey: 'processed',
    header: 'טופל',
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="success">כן</Badge>
      ) : (
        <Badge variant="destructive">לא</Badge>
      ),
  },
  {
    accessorKey: 'target_table',
    header: 'טבלת יעד',
    cell: ({ getValue }) => (
      <span className="text-xs font-mono text-muted-foreground">{(getValue() as string) ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'target_id',
    header: 'Target ID',
    cell: ({ getValue }) => (
      <span className="text-xs font-mono text-muted-foreground truncate max-w-[8rem] block">
        {(getValue() as string) ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'error_message',
    header: 'שגיאה',
    cell: ({ getValue }) => {
      const msg = getValue() as string | null
      return msg ? (
        <span className="text-xs text-red-600 max-w-xs truncate block" title={msg}>
          {msg}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      )
    },
  },
  {
    id: 'payload_view',
    header: 'Payload',
    cell: ({ row }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            הצג
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payload — {row.original.payload_type ?? 'לא ידוע'}</DialogTitle>
          </DialogHeader>
          <PayloadViewer payload={row.original.payload} />
        </DialogContent>
      </Dialog>
    ),
  },
]

export function PayloadsClient({ data, totalCount, page, pageSize, distinctTypes, filters }: Props) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">סוג payload</Label>
            <Select
              value={filters.type ?? '__all__'}
              onValueChange={(v) => updateParam('type', v === '__all__' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="כל הסוגים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">כל הסוגים</SelectItem>
                {distinctTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="space-y-1 flex flex-col gap-2">
            <Label className="text-xs">מצב</Label>
            <div className="flex gap-2">
              <Button
                variant={filters.errorsOnly === 'true' ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  updateParam('errorsOnly', filters.errorsOnly === 'true' ? '' : 'true')
                }
              >
                שגיאות בלבד
              </Button>
              <Button
                variant={filters.unprocessedOnly === 'true' ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  updateParam('unprocessedOnly', filters.unprocessedOnly === 'true' ? '' : 'true')
                }
              >
                לא טופלו
              </Button>
            </div>
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
        emptyMessage="אין payloads להצגה"
      />
    </div>
  )
}
