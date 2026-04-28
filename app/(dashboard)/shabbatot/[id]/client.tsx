'use client'

import { useState, useMemo } from 'react'
import { Search, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PhoneCell } from '@/components/phone-cell'
import { formatDateTime, exportToCsv } from '@/lib/utils'

interface Registration {
  id: number
  full_name: string | null
  phone: string | null
  email: string | null
  reg_evening: number | null
  reg_morning: number | null
  reg_donation_success: boolean
  lang: string | null
  created_at: string
  person_id: number | null
}

interface Props {
  registrations: Registration[]
  shabbatName: string
}

export function ShabbatDetailClient({ registrations, shabbatName }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return registrations
    const q = search.toLowerCase()
    return registrations.filter(
      (r) =>
        (r.full_name ?? '').toLowerCase().includes(q) ||
        (r.phone ?? '').includes(q) ||
        (r.email ?? '').toLowerCase().includes(q)
    )
  }, [registrations, search])

  function handleExport() {
    const today = new Date().toISOString().slice(0, 10)
    exportToCsv(
      `${shabbatName}-${today}.csv`,
      {
        full_name: 'שם מלא',
        phone: 'טלפון',
        email: 'אימייל',
        reg_evening: 'כמות לערב',
        reg_morning: 'כמות לבוקר',
        reg_donation_success: 'האם תרם',
        lang: 'שפה',
        created_at: 'תאריך הרשמה',
      },
      filtered.map((r) => ({
        ...r,
        reg_donation_success: r.reg_donation_success ? 'כן' : 'לא',
        created_at: formatDateTime(r.created_at),
      }))
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">
          נרשמים ({filtered.length}{filtered.length !== registrations.length ? ` מתוך ${registrations.length}` : ''})
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חפש לפי שם / טלפון / אימייל..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          לא נמצאו נרשמים התואמים את החיפוש
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-start font-medium text-muted-foreground">שם מלא</th>
                <th className="h-12 px-4 text-start font-medium text-muted-foreground">טלפון</th>
                <th className="h-12 px-4 text-start font-medium text-muted-foreground">אימייל</th>
                <th className="h-12 px-4 text-center font-medium text-muted-foreground">ערב</th>
                <th className="h-12 px-4 text-center font-medium text-muted-foreground">בוקר</th>
                <th className="h-12 px-4 text-center font-medium text-muted-foreground">תרומה</th>
                <th className="h-12 px-4 text-start font-medium text-muted-foreground">שפה</th>
                <th className="h-12 px-4 text-start font-medium text-muted-foreground">תאריך הרשמה</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{reg.full_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <PhoneCell phone={reg.phone} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{reg.email ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{reg.reg_evening ?? 0}</td>
                  <td className="px-4 py-3 text-center">{reg.reg_morning ?? 0}</td>
                  <td className="px-4 py-3 text-center">
                    {reg.reg_donation_success ? (
                      <Badge variant="success">כן</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{reg.lang ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDateTime(reg.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
