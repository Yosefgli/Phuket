import { Suspense } from 'react'
import { Calendar, Heart, Users, ClipboardList, AlertCircle, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatCard, StatCardSkeleton } from '@/components/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

async function DashboardStats() {
  const supabase = createClient()

  // Run all queries in parallel
  const [
    donationsResult,
    registrationsResult,
    shabbatotResult,
    monthDonationsResult,
    nextShabbatResult,
    payloadsErrorResult,
  ] = await Promise.all([
    supabase
      .from('donations')
      .select('amount', { count: 'exact' })
      .limit(1000),
    supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('shabbatot')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('donations')
      .select('amount')
      .gte(
        'created_at',
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      )
      .limit(1000),
    supabase
      .from('shabbatot')
      .select('id, name, date, event_id')
      .gte('date', new Date().toISOString().slice(0, 10))
      .order('date', { ascending: true })
      .limit(1),
    supabase
      .from('incoming_payloads')
      .select('id', { count: 'exact', head: true })
      .or('processed.is.false,error_message.not.is.null'),
  ])

  const totalDonationsSum = (donationsResult.data ?? []).reduce(
    (s: number, d: { amount: number | null }) => s + (d.amount ?? 0),
    0
  )
  const totalDonationsCount = donationsResult.count ?? 0
  const totalRegistrations = registrationsResult.count ?? 0
  const totalShabbatot = shabbatotResult.count ?? 0
  const monthSum = (monthDonationsResult.data ?? []).reduce(
    (s: number, d: { amount: number | null }) => s + (d.amount ?? 0),
    0
  )
  const nextShabbat = (nextShabbatResult.data)?.[0] ?? null
  const payloadsErrors = payloadsErrorResult.count ?? 0

  // Get registrations count for next shabbat
  let nextShabbatCount = 0
  if (nextShabbat) {
    const { count } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', nextShabbat.event_id ?? '')
    nextShabbatCount = count ?? 0
  }

  return (
    <>
      {/* Next Shabbat Banner */}
      {nextShabbat && (
        <Card className="border-primary/30 bg-primary/5 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground">שבת הקרובה</p>
                <h2 className="text-xl font-bold text-foreground mt-1">
                  {nextShabbat.name ?? 'שבת קרובה'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {nextShabbat.date ? formatDate(nextShabbat.date) : '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{nextShabbatCount}</p>
                <p className="text-sm text-muted-foreground">נרשמים</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!nextShabbat && (
        <Card className="border-muted mb-6">
          <CardContent className="p-4">
            <p className="text-muted-foreground text-sm">אין שבת קרובה מתוזמנת במערכת</p>
          </CardContent>
        </Card>
      )}

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="סך כל התרומות"
          value={formatCurrency(totalDonationsSum)}
          icon={Heart}
          description={`${totalDonationsCount.toLocaleString('he-IL')} תרומות`}
        />
        <StatCard
          title="תרומות החודש"
          value={formatCurrency(monthSum)}
          icon={TrendingUp}
          description={new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
        />
        <StatCard
          title="סך הרשמות"
          value={totalRegistrations.toLocaleString('he-IL')}
          icon={ClipboardList}
        />
        <StatCard
          title="שבתות / אירועים"
          value={totalShabbatot.toLocaleString('he-IL')}
          icon={Calendar}
        />
      </div>

      {/* Errors alert */}
      {payloadsErrors > 0 && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                ישנן {payloadsErrors} רשומות שגיאה / לא טופלו ב-Incoming Payloads
              </p>
              <a href="/payloads" className="text-sm text-red-600 hover:underline">
                צפה בשגיאות ←
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="h-28 rounded-lg border bg-muted/30 mb-6 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">דשבורד</h1>
        <p className="text-muted-foreground">סיכום כללי של המערכת</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
      </Suspense>
    </div>
  )
}
