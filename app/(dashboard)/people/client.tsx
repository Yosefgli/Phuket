'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { DataTable } from '@/components/data-table'
import { PhoneCell } from '@/components/phone-cell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate } from '@/lib/utils'

interface EnrichedPerson {
  id: string
  full_name: string | null
  phone: string | null
  email: string | null
  created_at: string
  donation_count: number
  donation_sum: number
  registration_count: number
}

interface Props {
  data: EnrichedPerson[]
  totalCount: number
  page: number
  pageSize: number
  filters: Record<string, string | undefined>
}

const columns: ColumnDef<EnrichedPerson>[] = [
  {
    accessorKey: 'full_name',
    header: 'שם מלא',
    cell: ({ getValue, row }) => (
      <Link href={`/people/${row.original.id}`} className="font-medium text-primary hover:underline">
        {(getValue() as string) ?? '—'}
      </Link>
    ),
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
    accessorKey: 'donation_count',
    header: 'מספר תרומות',
    cell: ({ getValue }) => (
      <span className="text-center block font-medium">{getValue() as number}</span>
    ),
    meta: { sortable: true },
  },
  {
    accessorKey: 'donation_sum',
    header: 'סך תרומות',
    cell: ({ getValue }) => (
      <span className="font-bold text-green-700">{formatCurrency(getValue() as number)}</span>
    ),
    meta: { sortable: true },
  },
  {
    accessorKey: 'registration_count',
    header: 'מספר הרשמות',
    cell: ({ getValue }) => (
      <span className="text-center block">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'תאריך יצירה',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">{formatDate(getValue() as string)}</span>
    ),
    meta: { sortable: true },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/people/${row.original.id}`}>פרטים</Link>
      </Button>
    ),
  },
]

export function PeopleClient({ data, totalCount, page, pageSize, filters }: Props) {
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div className="space-y-1">
            <Label className="text-xs">חיפוש</Label>
            <Input
              placeholder="שם / טלפון / אימייל"
              defaultValue={filters.search}
              onChange={(e) => {
                const val = e.target.value
                setTimeout(() => updateParam('search', val), 300)
              }}
            />
          </div>
        </div>
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => router.replace(pathname)}
          >
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
        exportFilename="people"
        exportHeaders={{
          full_name: 'שם מלא',
          phone: 'טלפון',
          email: 'אימייל',
          donation_count: 'מספר תרומות',
          donation_sum: 'סך תרומות',
          registration_count: 'מספר הרשמות',
          created_at: 'תאריך יצירה',
        }}
      />
    </div>
  )
}
