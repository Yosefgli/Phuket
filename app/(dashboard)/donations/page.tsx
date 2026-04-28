import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { StatCard } from '@/components/stat-card'
import { Heart, TrendingUp, Hash, ArrowUp } from 'lucide-react'
import { DonationsClient } from './client'

interface Props {
  searchParams: {
    page?: string
    pageSize?: string
    sort?: string
    order?: string
    search?: string
    from?: string
    to?: string
    product?: string
    terminal?: string
    minAmount?: string
    maxAmount?: string
  }
}

interface DonationStats {
  sum: number
  count: number
  avg: number
  max: number
}

export default async function DonationsPage({ searchParams }: Props) {
  const supabase = createClient()

  const page = Math.max(1, Number(searchParams.page ?? 1))
  const pageSize = [20, 50, 100].includes(Number(searchParams.pageSize))
    ? Number(searchParams.pageSize)
    : 50
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const sortCol = searchParams.sort ?? 'payment_date'
  const sortAsc = searchParams.order === 'asc'

  // Build filtered query
  let query = supabase
    .from('donations')
    .select('*', { count: 'exact' })

  if (searchParams.search) {
    query = query.or(
      `full_name.ilike.%${searchParams.search}%,phone.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%,payment_id.ilike.%${searchParams.search}%`
    )
  }
  if (searchParams.from) query = query.gte('payment_date', searchParams.from)
  if (searchParams.to) query = query.lte('payment_date', searchParams.to + 'T23:59:59')
  if (searchParams.product) query = query.ilike('product_name', `%${searchParams.product}%`)
  if (searchParams.terminal) query = query.ilike('terminal_name', `%${searchParams.terminal}%`)
  if (searchParams.minAmount) query = query.gte('amount', Number(searchParams.minAmount))
  if (searchParams.maxAmount) query = query.lte('amount', Number(searchParams.maxAmount))

  // Run paginated data + aggregate stats in parallel
  const [{ data, count, error }, { data: statsRaw }] = await Promise.all([
    query.order(sortCol, { ascending: sortAsc }).range(from, to),
    supabase.rpc('get_donation_stats', {
      p_search:     searchParams.search     ?? null,
      p_from:       searchParams.from       ?? null,
      p_to:         searchParams.to         ?? null,
      p_product:    searchParams.product    ?? null,
      p_terminal:   searchParams.terminal   ?? null,
      p_min_amount: searchParams.minAmount  ? Number(searchParams.minAmount)  : null,
      p_max_amount: searchParams.maxAmount  ? Number(searchParams.maxAmount)  : null,
    }),
  ])

  const stats = (statsRaw ?? { sum: 0, count: 0, avg: 0, max: 0 }) as DonationStats

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">תרומות</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-6">
          <p className="text-red-600 font-medium">שגיאה בטעינת נתוני התרומות. נסה לרענן.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">תרומות</h1>
        <p className="text-muted-foreground">כל התרומות והתשלומים</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="סך תרומות"        value={formatCurrency(stats.sum)}   icon={Heart} />
        <StatCard title="מספר תרומות"      value={Number(stats.count).toLocaleString('he-IL')} icon={Hash} />
        <StatCard title="ממוצע תרומה"      value={formatCurrency(stats.avg)}   icon={TrendingUp} />
        <StatCard title="תרומה מקסימלית"  value={formatCurrency(stats.max)}   icon={ArrowUp} />
      </div>

      <DonationsClient
        data={data ?? []}
        totalCount={count ?? 0}
        page={page}
        pageSize={pageSize}
        filters={searchParams}
      />
    </div>
  )
}
