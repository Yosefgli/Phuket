import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PhoneCell } from '@/components/phone-cell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from 'lucide-react'

interface Props {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? ''

  if (!q) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">חיפוש גלובלי</h1>
        <div className="rounded-md border p-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">הזן מונח חיפוש בשורת החיפוש למעלה</p>
        </div>
      </div>
    )
  }

  const supabase = createClient()
  const like = `%${q}%`

  const [peopleResult, donationsResult, regsResult] = await Promise.all([
    supabase
      .from('people')
      .select('id, full_name, phone, email, created_at')
      .or(`full_name.ilike.${like},phone.ilike.${like},email.ilike.${like}`)
      .limit(20),
    supabase
      .from('donations')
      .select('id, full_name, phone, email, amount, payment_id, payment_date, person_id')
      .or(
        `full_name.ilike.${like},phone.ilike.${like},email.ilike.${like},payment_id.ilike.${like}`
      )
      .limit(20),
    supabase
      .from('event_registrations')
      .select('id, full_name, phone, email, event_id, evening_count, morning_count, created_at')
      .or(
        `full_name.ilike.${like},phone.ilike.${like},email.ilike.${like},event_id.ilike.${like}`
      )
      .limit(20),
  ])

  const people = peopleResult.data ?? []
  const donations = donationsResult.data ?? []
  const regs = regsResult.data ?? []
  const totalResults = people.length + donations.length + regs.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          תוצאות חיפוש עבור: <span className="text-primary">&ldquo;{q}&rdquo;</span>
        </h1>
        <p className="text-muted-foreground">{totalResults} תוצאות נמצאו</p>
      </div>

      {totalResults === 0 && (
        <div className="rounded-md border p-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">לא נמצאו תוצאות עבור &ldquo;{q}&rdquo;</p>
        </div>
      )}

      {/* People results */}
      {people.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">אנשים ({people.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">שם</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">טלפון</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">אימייל</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">תאריך</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.full_name ?? '—'}</td>
                    <td className="px-4 py-3"><PhoneCell phone={p.phone} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.email ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/people/${p.id}`} className="text-primary text-sm hover:underline">
                        פרטים
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Donations results */}
      {donations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">תרומות ({donations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">שם</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">טלפון</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">סכום</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">Payment ID</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{d.full_name ?? '—'}</td>
                    <td className="px-4 py-3"><PhoneCell phone={d.phone} /></td>
                    <td className="px-4 py-3 font-bold text-green-700">
                      {formatCurrency(d.amount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {d.payment_id ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(d.payment_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Registrations results */}
      {regs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">הרשמות ({regs.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">שם</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">טלפון</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">Event ID</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">ערב</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">בוקר</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {regs.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{r.full_name ?? '—'}</td>
                    <td className="px-4 py-3"><PhoneCell phone={r.phone} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {r.event_id ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">{r.evening_count ?? 0}</td>
                    <td className="px-4 py-3 text-center">{r.morning_count ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
