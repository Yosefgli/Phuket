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

interface PersonStat {
  person_id: number
  donation_count: number
  donation_sum: number
  registration_count: number
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

  const personIds = (people ?? []).map((p) => p.id)

  let statsMap: Record<number, PersonStat> = {}
  if (personIds.length > 0) {
    const { data: statsRows } = await supabase.rpc('get_people_stats', {
      p_person_ids: personIds,
    })
    for (const row of (statsRows ?? []) as PersonStat[]) {
      statsMap[row.person_id] = row
    }
  }

  const enrichedPeople = (people ?? []).map((p) => ({
    ...p,
    donation_count:    statsMap[p.id]?.donation_count    ?? 0,
    donation_sum:      statsMap[p.id]?.donation_sum      ?? 0,
    registration_count: statsMap[p.id]?.registration_count ?? 0,
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
