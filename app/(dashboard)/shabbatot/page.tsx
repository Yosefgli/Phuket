import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ShabbatotPage() {
  const supabase = createClient()

  const { data: shabbatot, error } = await supabase
    .from('shabbatot')
    .select('id, event_id, name, date, time, location, created_at')
    .order('date', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-6">
        <p className="text-red-600 font-medium">שגיאה בטעינת נתוני השבתות. נסה לרענן את העמוד.</p>
      </div>
    )
  }

  if (!shabbatot || shabbatot.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">שבתות</h1>
          <p className="text-muted-foreground">רשימת כל השבתות והאירועים</p>
        </div>
        <div className="rounded-md border p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">אין שבתות במערכת</p>
        </div>
      </div>
    )
  }

  // For each shabbat, get registration counts
  const eventIds = shabbatot.map((s) => s.event_id).filter(Boolean) as string[]

  const { data: regCounts } = await supabase
    .from('event_registrations')
    .select('event_id, evening_count, morning_count, person_id, is_donor')
    .in('event_id', eventIds.length > 0 ? eventIds : ['__none__'])
    .limit(10000)

  // Build lookup by event_id
  const regByEvent: Record<
    string,
    { evening: number; morning: number; uniquePeople: Set<string>; donors: number }
  > = {}

  for (const reg of regCounts ?? []) {
    if (!reg.event_id) continue
    if (!regByEvent[reg.event_id]) {
      regByEvent[reg.event_id] = { evening: 0, morning: 0, uniquePeople: new Set(), donors: 0 }
    }
    regByEvent[reg.event_id].evening += reg.evening_count ?? 0
    regByEvent[reg.event_id].morning += reg.morning_count ?? 0
    if (reg.person_id) regByEvent[reg.event_id].uniquePeople.add(reg.person_id)
    if (reg.is_donor) regByEvent[reg.event_id].donors += 1
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">שבתות</h1>
        <p className="text-muted-foreground">
          {shabbatot.length} שבתות / אירועים
        </p>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-start font-medium text-muted-foreground">שם שבת</th>
              <th className="h-12 px-4 text-start font-medium text-muted-foreground">Event ID</th>
              <th className="h-12 px-4 text-start font-medium text-muted-foreground">תאריך</th>
              <th className="h-12 px-4 text-start font-medium text-muted-foreground">שעה</th>
              <th className="h-12 px-4 text-start font-medium text-muted-foreground">מיקום</th>
              <th className="h-12 px-4 text-center font-medium text-muted-foreground">ערב</th>
              <th className="h-12 px-4 text-center font-medium text-muted-foreground">בוקר</th>
              <th className="h-12 px-4 text-center font-medium text-muted-foreground">סה״כ נרשמים</th>
              <th className="h-12 px-4 text-center font-medium text-muted-foreground">ייחודיים</th>
              <th className="h-12 px-4 text-center font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {shabbatot.map((shabbat) => {
              const stats = shabbat.event_id ? regByEvent[shabbat.event_id] : undefined
              const isPast = shabbat.date ? shabbat.date < today : false
              const isUpcoming = shabbat.date ? shabbat.date >= today : false

              return (
                <tr
                  key={shabbat.id}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {isUpcoming && (
                        <Badge variant="success" className="text-xs">
                          קרובה
                        </Badge>
                      )}
                      {shabbat.name ?? '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {shabbat.event_id ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {shabbat.date ? formatDate(shabbat.date) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {shabbat.time ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {shabbat.location ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {stats?.evening ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {stats?.morning ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-primary">
                    {(stats?.evening ?? 0) + (stats?.morning ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stats?.uniquePeople.size ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/shabbatot/${shabbat.id}`}>פרטים</Link>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
