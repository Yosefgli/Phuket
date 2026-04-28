import { Suspense } from 'react'
import { Calendar, Heart, Users, ClipboardList, AlertCircle, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatCard, StatCardSkeleton } from '@/components/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DashboardStats {
  total_donations_sum: number
  total_donations_count: number
  month_donations_sum: number
  total_registrations: number
  total_shabbatot: number
  next_shabbat_id: number | null
  next_shabbat_name: string | null
  next_shabbat_date: string | null
  next_shabbat_event_id: string | null
  next_shabbat_count: number
  payloads_errors: number
}

async function DashboardStats() {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_dashboard_stats')
  if (error || !data) {
    return <p className="text-red-600">שגיאה בטעינת הדשבורד. נסה לרענן.</p>
  }

  const stats = data as DashboardStats

  return (
    <>
      {/* Next Shabbat Banner */}
      {stats.next_shabbat_id ? (
        <Card className="border-primary/30 bg-primary/5 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground">שבת הקרובה</p>
                <h2 className="text-xl font-bold text-foreground mt-1">
                  {stats.next_shabbat_name ?? 'שבת קרובה'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.next_shabbat_date ? formatDate(stats.next_shabbat_date) : '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{stats.next_shabbat_count}</p>
                <p className="text-sm text-muted-foreground">נרשמים</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
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
          value={formatCurrency(stats.total_donations_sum)}
          icon={Heart}
          description={`${Number(stats.total_donations_count).toLocaleString('he-IL')} תרומות`}
        />
        <StatCard
          title="תרומות החודש"
          value={formatCurrency(stats.month_donations_sum)}
          icon={TrendingUp}
          description={new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
        />
        <StatCard
          title="סך הרשמות"
          value={Number(stats.total_registrations).toLocaleString('he-IL')}
          icon={ClipboardList}
        />
        <StatCard
          title="שבתות / אירועים"
          value={Number(stats.total_shabbatot).toLocaleString('he-IL')}
          icon={Calendar}
        />
      </div>

      {/* Errors alert */}
      {stats.payloads_errors > 0 && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                ישנן {stats.payloads_errors} רשומות שגיאה / לא טופלו ב-Incoming Payloads
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
