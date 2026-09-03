import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
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
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse-soft rounded-xl bg-subtle" />
            ))}
          </div>
        ) : visits.length === 0 ? (
          <EmptyState title="No visits recorded yet" description="Field visit records will appear here." />
        ) : (
          <div className="divide-y divide-border-light">
            {visits.map((v, i) => (
              <motion.div
                key={v._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-col gap-3 p-5 transition-colors hover:bg-subtle/30 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={v.memberId ? `${v.memberId.firstName} ${v.memberId.lastName}` : '?'} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-dark">
                      {v.memberId ? `${v.memberId.firstName} ${v.memberId.lastName}` : 'Unknown member'}
                    </p>
                    <p className="truncate text-sm text-muted">{v.notes || 'No notes'}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm text-muted">
                  <span>{v.officerId?.name}</span>
                  <span>·</span>
                  <span>{formatDate(v.date, true)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
