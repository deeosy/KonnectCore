import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MapPinned, Users } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import Select from '../components/ui/Select'
import StatCard from '../components/ui/StatCard'
import VisitModal from '../components/visits/VisitModal'
import { formatDate } from '../utils/format'

export default function VisitsPage() {
  const { hasRole } = useAuth()
  const isLeader = hasRole('admin') || hasRole('manager')
  const [visits, setVisits] = useState([])
  const [officers, setOfficers] = useState([])
  const [officerId, setOfficerId] = useState('')
  const [visitOpen, setVisitOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = officerId ? `?officerId=${officerId}` : ''
    api.get(`/visits${params}`)
      .then(({ data }) => setVisits(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [officerId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!isLeader) return
    api
      .get('/users')
      .then(({ data }) =>
        setOfficers((data.data || []).filter((u) => u.role === 'fieldOfficer' && u.isActive !== false)),
      )
      .catch(() => setOfficers([]))
  }, [isLeader])

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthVisits = visits.filter((v) => new Date(v.date) >= startOfMonth).length
  const membersVisited = new Set(visits.map((v) => v?.memberId?._id).filter(Boolean)).size

  return (
    <div>
      <PageHeader
        title="Field Visits"
        subtitle="Recorded visits to members"
        action={
          <Button size="sm" onClick={() => setVisitOpen(true)}>
            <MapPinned className="h-4 w-4" /> Record Visit
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={MapPinned} label="Total visits shown" value={visits.length} accent="primary" />
        <StatCard icon={MapPinned} label="Visits this month" value={monthVisits} accent="success" />
        <StatCard icon={Users} label="Members visited" value={membersVisited} accent="info" />
      </div>

      {isLeader && officers.length > 0 && (
        <div className="mt-6">
          <Select
            label="Filter by officer"
            placeholder="All officers"
            options={officers.map((o) => ({ value: o._id, label: o.name }))}
            value={officerId}
            onChange={(e) => setOfficerId(e.target.value)}
            className="max-w-xs"
          />
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse-soft rounded-xl bg-subtle" />
            ))}
          </div>
        ) : visits.length === 0 ? (
          <EmptyState
            title="No visits recorded yet"
            description={
              officerId
                ? 'No visits for this officer.'
                : 'Use “Record Visit” to log a member visit from the field.'
            }
          />
        ) : (
          <div className="divide-y divide-border-light">
            {visits.map((v, i) => (
              <motion.div
                key={v._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="flex flex-col gap-3 p-5 transition-colors hover:bg-subtle/30 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar
                    name={v.memberId ? `${v.memberId.firstName} ${v.memberId.lastName}` : '?'}
                    src={v.memberId?.photo}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-dark">
                      {v.memberId ? `${v.memberId.firstName} ${v.memberId.lastName}` : 'Unknown member'}
                    </p>
                    <p className="truncate text-sm text-muted">{v.purpose || v.notes || 'No notes'}</p>
                    {v.photos?.length > 0 && (
                      <span className="mt-0.5 inline-flex text-[11px] font-medium text-primary">
                        {v.photos.length} photo{v.photos.length > 1 ? 's' : ''}
                      </span>
                    )}
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

      <VisitModal open={visitOpen} onClose={() => setVisitOpen(false)} onSaved={load} />
    </div>
  )
}