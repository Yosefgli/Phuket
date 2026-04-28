import { createClient } from '@/lib/supabase/server'
import { RegistrationsClient } from './client'

interface Props {
  searchParams: {
    page?: string
    pageSize?: string
    sort?: string
    order?: string
    search?: string
    shabbat?: string
    from?: string
    to?: string
    donor?: string
    language?: string
  }
}

export default async function RegistrationsPage({ searchParams }: Props) {
  const supabase = createClient()

  const page = Math.max(1, Number(searchParams.page ?? 1))
  const pageSize = [20, 50, 100].includes(Number(searchParams.pageSize))
    ? Number(searchParams.pageSize)
    : 50
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const sortCol = searchParams.sort ?? 'created_at'
  const sortAsc = searchParams.order === 'asc'

  // Build query
  let query = supabase
    .from('event_registrations')
    .select('*', { count: 'exact' })

  if (searchParams.search) {
    query = query.or(
      `full_name.ilike.%${searchParams.search}%,phone.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`
    )
  }
  if (searchParams.shabbat) {
    query = query.eq('event_id', searchParams.shabbat)
  }
  if (searchParams.from) {
    query = query.gte('created_at', searchParams.from)
  }
  if (searchParams.to) {
    query = query.lte('created_at', searchParams.to + 'T23:59:59')
  }
  if (searchParams.donor === 'true') {
    query = query.eq('reg_donation_success', true)
  } else if (searchParams.donor === 'false') {
    query = query.eq('reg_donation_success', false)
  }
  if (searchParams.language) {
    query = query.eq('lang', searchParams.language)
  }

  const { data, count, error } = await query
    .order(sortCol, { ascending: sortAsc })
    .range(from, to)

  // Get shabbatot list for filter dropdown
  const { data: shabbatot } = await supabase
    .from('shabbatot')
    .select('event_id, shabbat, event_date')
    .order('event_date', { ascending: false })
    .limit(100)

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">הרשמות</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-6">
          <p className="text-red-600 font-medium">שגיאה בטעינת נתוני ההרשמות. נסה לרענן את העמוד.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">הרשמות</h1>
        <p className="text-muted-foreground">כל ההרשמות לאירועים</p>
      </div>

      <RegistrationsClient
        data={data ?? []}
        totalCount={count ?? 0}
        page={page}
        pageSize={pageSize}
        shabbatot={shabbatot ?? []}
        filters={searchParams}
      />
    </div>
  )
}
