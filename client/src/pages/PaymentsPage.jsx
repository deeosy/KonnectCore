import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../utils/format'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payments?limit=50')
      .then(({ data }) => setPayments(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Payments & Dues" subtitle="Member payments, dues and contributions" />
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse-soft rounded-xl bg-subtle" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <EmptyState title="No payments recorded yet" description="Payments will appear here once recorded." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light">
              <thead>
                <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {payments.map((p, i) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-primary-50/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-muted">{formatDate(p.paymentDate)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-dark">
                      {p.memberId ? `${p.memberId.firstName} ${p.memberId.lastName}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm capitalize">{p.type.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3.5 text-sm capitalize">{p.method.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-dark">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3.5"><Badge status={p.status} /></td>
                    <td className="px-5 py-3.5 text-sm text-muted">{p.receiptNumber || '—'}</td>
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
