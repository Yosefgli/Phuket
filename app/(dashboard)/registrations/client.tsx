'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { PhoneCell } from '@/components/phone-cell'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatDateTime } from '@/lib/utils'
import type { EventRegistration } from '@/lib/database.types'

interface Props {
  data: EventRegistration[]
  totalCount: number
  page: number
  pageSize: number
  shabbatot: { event_id: string | null; name: string | null; date: string | null }[]
  filters: Record<string, string | undefined>
}

const CSV_HEADERS: Record<string, string> = {
  full_name: 'שם מלא',
  phone: 'טלפון',
  email: 'אימייל',
  event_id: 'Event ID',
  evening_count: 'ערב',
  morning_count: 'בוקר',
  is_donor: 'תרם',
  language: 'שפה',
  location: 'מיקום',
  created_at: 'תאריך יצירה',
}

const columns: ColumnDef<EventRegistration>[] = [
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
    accessorKey: 'event_id',
    header: 'Event ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">{(getValue() as string) ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'evening_count',
    header: 'ערב',
    cell: ({ getValue }) => <span className="text-center block">{(getValue() as number) ?? 0}</span>,
    meta: { sortable: true },
  },
  {
    accessorKey: 'morning_count',
    header: 'בוקר',
    cell: ({ getValue }) => <span className="text-center block">{(getValue() as number) ?? 0}</span>,
    meta: { sortable: true },
  },
  {
    accessorKey: 'is_donor',
    header: 'תרומה',
    cell: ({ getValue }) =>
      getValue() ? <Badge variant="success">כן</Badge> : <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: 'language',
    header: 'שפה',
    cell: ({ getValue }) => <span className="text-muted-foreground">{(getValue() as string) ?? '—'}</span>,
  },
  {
    accessorKey: 'location',
    header: 'מיקום',
    cell: ({ getValue }) => <span className="text-muted-foreground text-xs">{(getValue() as string) ?? '—'}</span>,
  },
  {
    accessorKey: 'created_at',
    header: 'תאריך יצירה',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-xs">{formatDateTime(getValue() as string)}</span>
    ),
    meta: { sortable: true },
  },
]

export function RegistrationsClient({ data, totalCount, page, pageSize, shabbatot, filters }: Props) {
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

  function clearFilters() {
    router.replace(pathname)
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-md border p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">חיפוש</Label>
            <Input
              placeholder="שם / טלפון / אימייל"
              defaultValue={filters.search}
              onChange={(e) => {
                const val = e.target.value
                const timer = setTimeout(() => updateParam('search', val), 300)
                return () => clearTimeout(timer)
              }}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">שבת / אירוע</Label>
            <Select
              value={filters.shabbat ?? '__all__'}
              onValueChange={(v) => updateParam('shabbat', v === '__all__' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="כל השבתות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">כל השבתות</SelectItem>
                {shabbatot.map((s) =>
                  s.event_id ? (
                    <SelectItem key={s.event_id} value={s.event_id}>
                      {s.name ?? s.event_id}
                    </SelectItem>
                  ) : null
                )}
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

          <div className="space-y-1">
            <Label className="text-xs">תרומה</Label>
            <Select
              value={filters.donor ?? '__all__'}
              onValueChange={(v) => updateParam('donor', v === '__all__' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="הכל" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">הכל</SelectItem>
                <SelectItem value="true">תורמים בלבד</SelectItem>
                <SelectItem value="false">לא תורמים</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">שפה</Label>
            <Input
              placeholder="עברית / English..."
              defaultValue={filters.language}
              onChange={(e) => updateParam('language', e.target.value)}
            />
          </div>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            נקה פילטרים
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data.map((r) => ({
          ...r,
          _error: false,
        }))}
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={page}
        exportFilename="registrations"
        exportHeaders={CSV_HEADERS}
      />
    </div>
  )
}
