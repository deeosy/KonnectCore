import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../utils/format'

export default function CollectionsPage() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/collections?limit=50')
      .then(({ data }) => setCollections(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Collections"
        subtitle="Recorded produce collections and harvests"
        action={<Button onClick={() => navigate('/members')}>Record Collection</Button>}
      />
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse-soft rounded-xl bg-subtle" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <EmptyState title="No collections recorded yet" description="Collections will appear here once recorded." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light">
              <thead>
                <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Crop</th>
                  <th className="px-5 py-3.5">Qty</th>
                  <th className="px-5 py-3.5">Grade</th>
                  <th className="px-5 py-3.5">Total Value</th>
                  <th className="px-5 py-3.5">Captured By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {collections.map((c, i) => (
                  <motion.tr
                    key={c._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-primary-50/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-muted">{formatDate(c.date)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-dark">
                      {c.memberId ? `${c.memberId.firstName} ${c.memberId.lastName}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm">{c.crop}</td>
                    <td className="px-5 py-3.5 text-sm">{c.quantity} {c.unit}</td>
                    <td className="px-5 py-3.5"><Badge status={c.qualityGrade} label={`Grade ${c.qualityGrade}`} /></td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-dark">{formatCurrency(c.totalValue)}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{c.capturedBy?.name || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
