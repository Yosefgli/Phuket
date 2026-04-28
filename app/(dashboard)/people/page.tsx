import { createClient } from '@/lib/supabase/server'
import { PeopleClient } from './client'

interface Props {
  searchParams: {
    page?: string
    pageSize?: string
    sort?: string
    order?: string
    search?: string
  }
}

export default async function PeoplePage({ searchParams }: Props) {
  const supabase = createClient()

  const page = Math.max(1, Number(searchParams.page ?? 1))
  const pageSize = [20, 50, 100].includes(Number(searchParams.pageSize))
    ? Number(searchParams.pageSize)
    : 50
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const sortCol = searchParams.sort ?? 'created_at'
  const sortAsc = searchParams.order === 'asc'

  let query = supabase
    .from('people')
    .select('id, full_name, phone, email, created_at', { count: 'exact' })

  if (searchParams.search) {
    query = query.or(
      `full_name.ilike.%${searchParams.search}%,phone.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`
    )
  }

  const { data: people, count, error } = await query
    .order(sortCol, { ascending: sortAsc })
    .range(from, to)

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">אנשים</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-6">
          <p className="text-red-600 font-medium">שגיאה בטעינת נתוני האנשים. נסה לרענן.</p>
        </div>
      </div>
    )
  }

  // Get donation/registration counts for this page of people
  const personIds = (people ?? []).map((p) => p.id)

  const [donationsCountResult, regsCountResult] = await Promise.all([
    personIds.length > 0
      ? supabase
          .from('donations')
          .select('person_id, amount')
          .in('person_id', personIds)
          .limit(5000)
      : Promise.resolve({ data: [] as { person_id: string | null; amount: number | null }[], error: null }),
    personIds.length > 0
      ? supabase
          .from('event_registrations')
          .select('person_id')
          .in('person_id', personIds)
          .limit(5000)
      : Promise.resolve({ data: [] as { person_id: string | null }[], error: null }),
  ])

  const donationsByPerson: Record<string, { count: number; sum: number }> = {}
  for (const d of donationsCountResult.data ?? []) {
    if (!d.person_id) continue
    if (!donationsByPerson[d.person_id]) {
      donationsByPerson[d.person_id] = { count: 0, sum: 0 }
    }
    donationsByPerson[d.person_id].count += 1
    donationsByPerson[d.person_id].sum += d.amount ?? 0
  }

  const regsByPerson: Record<string, number> = {}
  for (const r of regsCountResult.data ?? []) {
    if (!r.person_id) continue
    regsByPerson[r.person_id] = (regsByPerson[r.person_id] ?? 0) + 1
  }

  const enrichedPeople = (people ?? []).map((p) => ({
    ...p,
    donation_count: donationsByPerson[p.id]?.count ?? 0,
    donation_sum: donationsByPerson[p.id]?.sum ?? 0,
    registration_count: regsByPerson[p.id] ?? 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">אנשים</h1>
        <p className="text-muted-foreground">כל אנשי הקשר במערכת</p>
      </div>

      <PeopleClient
        data={enrichedPeople}
        totalCount={count ?? 0}
        page={page}
        pageSize={pageSize}
        filters={searchParams}
      />
    </div>
  )
}
