import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ShabbatRegStat {
  event_id: string
  evening_total: number
  morning_total: number
  unique_people: number
  donors: number
}

export default async function ShabbatotPage() {
  const supabase = createClient()

  const { data: shabbatot, error } = await supabase
    .from('shabbatot')
    .select('id, event_id, shabbat, event_date, event_time, location, created_at')
    .order('event_date', { ascending: false })
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

  const eventIds = shabbatot.map((s) => s.event_id).filter(Boolean) as string[]

  const regByEvent: Record<string, ShabbatRegStat> = {}
  if (eventIds.length > 0) {
    const { data: statsRows } = await supabase.rpc('get_shabbat_reg_stats', {
      p_event_ids: eventIds,
    })
    for (const row of (statsRows ?? []) as ShabbatRegStat[]) {
      regByEvent[row.event_id] = row
    }
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
              const isUpcoming = shabbat.event_date ? shabbat.event_date >= today : false

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
                      {shabbat.shabbat ?? '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {shabbat.event_id ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {shabbat.event_date ? formatDate(shabbat.event_date) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {shabbat.event_time ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {shabbat.location ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {stats?.evening_total ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {stats?.morning_total ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-primary">
                    {(stats?.evening_total ?? 0) + (stats?.morning_total ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stats?.unique_people ?? 0}
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
