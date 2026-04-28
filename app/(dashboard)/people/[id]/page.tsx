import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PhoneCell } from '@/components/phone-cell'
import { ArrowRight } from 'lucide-react'

interface Props {
  params: { id: string }
}

export default async function PersonDetailPage({ params }: Props) {
  const supabase = createClient()

  const personResult = await supabase
    .from('people')
    .select('id, full_name, phone, email, created_at')
    .eq('id', params.id)
    .single()

  if (personResult.error || !personResult.data) {
    notFound()
  }

  const person = personResult.data as { id: string; full_name: string | null; phone: string | null; email: string | null; created_at: string }

  const [donationsResult, registrationsResult] = await Promise.all([
    supabase
      .from('donations')
      .select('id, amount, currency, product_name, terminal_name, payment_id, payment_date, donor_note, recurring')
      .eq('person_id', params.id)
      .order('payment_date', { ascending: false })
      .limit(100),
    supabase
      .from('event_registrations')
      .select('id, event_id, shabbat_id, reg_evening, reg_morning, reg_donation_success, lang, location, created_at')
      .eq('person_id', params.id)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  const donations = donationsResult.data ?? []
  const registrations = registrationsResult.data ?? []

  // Get shabbat names for registrations
  const shabbatIds = registrations.map((r) => r.shabbat_id).filter(Boolean) as string[]
  const eventIds = registrations.map((r) => r.event_id).filter(Boolean) as string[]

  const { data: shabbatot } = await supabase
    .from('shabbatot')
    .select('id, event_id, shabbat, event_date')
    .or(
      [
        shabbatIds.length > 0 ? `id.in.(${shabbatIds.join(',')})` : null,
        eventIds.length > 0 ? `event_id.in.(${eventIds.join(',')})` : null,
      ]
        .filter(Boolean)
        .join(',') || 'id.eq.__none__'
    )
    .limit(100)

  const shabbatByEventId = Object.fromEntries(
    (shabbatot ?? []).filter((s) => s.event_id).map((s) => [s.event_id!, s])
  )
  const shabbatById = Object.fromEntries((shabbatot ?? []).map((s) => [s.id, s]))

  const totalDonations = donations.reduce((s, d) => s + (d.amount ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/people" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          חזרה לרשימת אנשים
        </Link>
      </Button>

      {/* Person header */}
      <div>
        <h1 className="text-2xl font-bold">{person.full_name ?? 'לא ידוע'}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
          {person.email && <span>{person.email}</span>}
          {person.created_at && <span>נוצר: {formatDate(person.created_at)}</span>}
        </div>
        {person.phone && (
          <div className="mt-2">
            <PhoneCell phone={person.phone} />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{donations.length}</p>
          <p className="text-sm text-muted-foreground mt-1">תרומות</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-green-700">{formatCurrency(totalDonations)}</p>
          <p className="text-sm text-muted-foreground mt-1">סך תרומות</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{registrations.length}</p>
          <p className="text-sm text-muted-foreground mt-1">הרשמות</p>
        </Card>
      </div>

      {/* Donations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">תרומות ({donations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {donations.length === 0 ? (
            <p className="p-6 text-muted-foreground text-sm">אין תרומות רשומות</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">סכום</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">מוצר</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">Payment ID</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">תאריך</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">הערה</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">חוזר</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-bold text-green-700">
                        {formatCurrency(d.amount)}
                        {d.currency && d.currency !== 'ILS' && (
                          <span className="text-xs text-muted-foreground ms-1">({d.currency})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.product_name ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {d.payment_id ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(d.payment_date)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                        {d.donor_note ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {d.recurring ? <Badge variant="secondary">כן</Badge> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">הרשמות ({registrations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {registrations.length === 0 ? (
            <p className="p-6 text-muted-foreground text-sm">אין הרשמות רשומות</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">שבת / אירוע</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">ערב</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">בוקר</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">תרומה</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">שפה</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">תאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => {
                    const shabbat =
                      (r.shabbat_id ? shabbatById[r.shabbat_id] : null) ??
                      (r.event_id ? shabbatByEventId[r.event_id] : null)
                    return (
                      <tr key={r.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3">
                          {shabbat ? (
                            <div>
                              <p className="font-medium">{shabbat.shabbat}</p>
                              <p className="text-xs text-muted-foreground">
                                {shabbat.event_date ? formatDate(shabbat.event_date) : r.event_id}
                              </p>
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">
                              {r.event_id ?? '—'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">{r.reg_evening ?? 0}</td>
                        <td className="px-4 py-3 text-center">{r.reg_morning ?? 0}</td>
                        <td className="px-4 py-3 text-center">
                          {r.reg_donation_success ? <Badge variant="secondary">כן</Badge> : '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.lang ?? '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDateTime(r.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
