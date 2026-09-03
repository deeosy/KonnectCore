import { useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import { formatDate } from '../utils/format'

export default function VisitsPage() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/visits')
      .then(({ data }) => setVisits(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Field Visits" subtitle="Recorded visits to members" />
      <div className="rounded-xl border border-navy-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-navy-100" />
            ))}
          </div>
        ) : visits.length === 0 ? (
          <p className="p-10 text-center text-sm text-navy-400">No visits recorded yet</p>
        ) : (
          <div className="divide-y divide-navy-100">
            {visits.map((v) => (
              <div key={v._id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {(v.memberId?.firstName || '?')[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy-900">
                      {v.memberId ? `${v.memberId.firstName} ${v.memberId.lastName}` : 'Unknown member'}
                    </p>
                    <p className="truncate text-sm text-navy-500">{v.notes || 'No notes'}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm text-navy-400">
                  <span>{v.officerId?.name}</span>
                  <span>·</span>
                  <span>{formatDate(v.date, true)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}