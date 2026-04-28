import { createClient } from '@/lib/supabase/server'
import { PayloadsClient } from './client'
import type { IncomingPayload } from '@/lib/database.types'

interface Props {
  searchParams: {
    page?: string
    pageSize?: string
    sort?: string
    order?: string
    errorsOnly?: string
    unprocessedOnly?: string
    type?: string
    from?: string
    to?: string
  }
}

export default async function PayloadsPage({ searchParams }: Props) {
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
    .from('incoming_payloads')
    .select('*', { count: 'exact' })

  if (searchParams.errorsOnly === 'true') {
    query = query.not('error_message', 'is', null)
  }
  if (searchParams.unprocessedOnly === 'true') {
    query = query.eq('processed', false)
  }
  if (searchParams.type) {
    query = query.eq('payload_type', searchParams.type)
  }
  if (searchParams.from) {
    query = query.gte('created_at', searchParams.from)
  }
  if (searchParams.to) {
    query = query.lte('created_at', searchParams.to + 'T23:59:59')
  }

  const { data, count, error } = await query
    .order(sortCol, { ascending: sortAsc })
    .range(from, to)

  // Get distinct payload types for filter
  const { data: types } = await supabase
    .from('incoming_payloads')
    .select('payload_type')
    .not('payload_type', 'is', null)
    .limit(1000)

  const distinctTypes = Array.from(
    new Set(
      ((types ?? []) as { payload_type: string | null }[])
        .map((t) => t.payload_type)
        .filter(Boolean)
    )
  ) as string[]

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">שגיאות / Payloads</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-6">
          <p className="text-red-600 font-medium">שגיאה בטעינת נתונים. נסה לרענן.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">שגיאות / Incoming Payloads</h1>
        <p className="text-muted-foreground">רשומות webhook שנכנסו למערכת</p>
      </div>

      <PayloadsClient
        data={(data ?? []).map((d: IncomingPayload) => ({
          ...d,
          _error: !d.processed || !!d.error_message,
        }))}
        totalCount={count ?? 0}
        page={page}
        pageSize={pageSize}
        distinctTypes={distinctTypes}
        filters={searchParams}
      />
    </div>
  )
}
