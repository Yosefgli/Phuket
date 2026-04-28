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

  const { data, count, error } = await query
    .order(sortCol, { ascending: sortAsc })
    .range(from, to)

  // Stats for current filtered data — derive from already-fetched page data
  // For accurate totals across all pages, compute from the paged query's full count
  // and re-fetch amounts with same filters
  const statsFilters: Record<string, string | undefined> = {
    search: searchParams.search,
    from: searchParams.from,
    to: searchParams.to,
    product: searchParams.product,
    terminal: searchParams.terminal,
    minAmount: searchParams.minAmount,
    maxAmount: searchParams.maxAmount,
  }

  let statsBase = supabase.from('donations').select('amount')
  if (statsFilters.search)
    statsBase = statsBase.or(
      `full_name.ilike.%${statsFilters.search}%,phone.ilike.%${statsFilters.search}%,email.ilike.%${statsFilters.search}%,payment_id.ilike.%${statsFilters.search}%`
    )
  if (statsFilters.from) statsBase = statsBase.gte('payment_date', statsFilters.from)
  if (statsFilters.to) statsBase = statsBase.lte('payment_date', statsFilters.to + 'T23:59:59')
  if (statsFilters.product) statsBase = statsBase.ilike('product_name', `%${statsFilters.product}%`)
  if (statsFilters.terminal) statsBase = statsBase.ilike('terminal_name', `%${statsFilters.terminal}%`)
  if (statsFilters.minAmount) statsBase = statsBase.gte('amount', Number(statsFilters.minAmount))
  if (statsFilters.maxAmount) statsBase = statsBase.lte('amount', Number(statsFilters.maxAmount))

  const { data: allAmounts } = await statsBase.limit(10000)

  const amounts = (allAmounts ?? []).map((d: { amount: number | null }) => d.amount ?? 0)
  const totalSum = amounts.reduce((s, a) => s + a, 0)
  const totalCount = amounts.length
  const avg = totalCount > 0 ? totalSum / totalCount : 0
  const max = amounts.length > 0 ? Math.max(...amounts) : 0

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="סך תרומות" value={formatCurrency(totalSum)} icon={Heart} />
        <StatCard title="מספר תרומות" value={totalCount.toLocaleString('he-IL')} icon={Hash} />
        <StatCard title="ממוצע תרומה" value={formatCurrency(avg)} icon={TrendingUp} />
        <StatCard title="תרומה מקסימלית" value={formatCurrency(max)} icon={ArrowUp} />
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
