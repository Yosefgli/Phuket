import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime, exportToCsv } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PhoneCell } from '@/components/phone-cell'
import { ShabbatDetailClient } from './client'

interface Props {
  params: { id: string }
}

export default async function ShabbatDetailPage({ params }: Props) {
  const supabase = createClient()

  const [shabbatResult, regsResult] = await Promise.all([
    supabase
      .from('shabbatot')
      .select('id, event_id, name, date, time, location')
      .eq('id', params.id)
      .single(),
    supabase
      .from('event_registrations')
      .select(
        'id, full_name, phone, email, evening_count, morning_count, is_donor, language, created_at, person_id'
      )
      .or(
        `shabbat_id.eq.${params.id},event_id.eq.${encodeURIComponent('placeholder')}`
      )
      .limit(500),
  ])

  if (shabbatResult.error || !shabbatResult.data) {
    notFound()
  }

  const shabbat = shabbatResult.data

  // Re-fetch registrations by event_id if available
  let registrations = regsResult.data ?? []
  if (shabbat.event_id) {
    const { data } = await supabase
      .from('event_registrations')
      .select(
        'id, full_name, phone, email, evening_count, morning_count, is_donor, language, created_at, person_id'
      )
      .or(`shabbat_id.eq.${params.id},event_id.eq.${shabbat.event_id}`)
      .order('created_at', { ascending: false })
      .limit(500)
    registrations = data ?? []
  }

  // Compute summary stats
  const totalEvening = registrations.reduce((s, r) => s + (r.evening_count ?? 0), 0)
  const totalMorning = registrations.reduce((s, r) => s + (r.morning_count ?? 0), 0)
  const uniquePeople = new Set(registrations.map((r) => r.person_id ?? r.phone ?? r.email).filter(Boolean)).size
  const donors = registrations.filter((r) => r.is_donor).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">{shabbat.name ?? 'שבת'}</h1>
          <Badge variant="outline">{shabbat.event_id ?? '—'}</Badge>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          {shabbat.date && <span>תאריך: {formatDate(shabbat.date)}</span>}
          {shabbat.time && <span>שעה: {shabbat.time}</span>}
          {shabbat.location && <span>מיקום: {shabbat.location}</span>}
        </div>
      </div>

      {/* Summary numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{totalEvening}</p>
          <p className="text-sm text-muted-foreground mt-1">נרשמים לערב</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{totalMorning}</p>
          <p className="text-sm text-muted-foreground mt-1">נרשמים לבוקר</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{uniquePeople}</p>
          <p className="text-sm text-muted-foreground mt-1">אנשים ייחודיים</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{donors}</p>
          <p className="text-sm text-muted-foreground mt-1">סימנו תרומה</p>
        </Card>
      </div>

      {/* Registrations table with client-side search */}
      <ShabbatDetailClient
        registrations={registrations}
        shabbatName={shabbat.name ?? 'שבת'}
      />
    </div>
  )
}
