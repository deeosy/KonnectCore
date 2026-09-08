import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../utils/format'

export default function LoansPage() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/loans')
      .then(({ data }) => setLoans(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const approve = async (id) => {
    await api.put(`/loans/${id}/approve`)
    load()
  }

  const disburse = async (id) => {
    await api.put(`/loans/${id}/disburse`)
    load()
  }

  return (
    <div>
      <PageHeader title="Loans" subtitle="Manage loan requests and repayments" />
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse-soft rounded-xl bg-subtle" />
            ))}
          </div>
        ) : loans.length === 0 ? (
          <EmptyState title="No loans recorded yet" description="Loan records will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light">
              <thead>
                <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Repaid</th>
                  <th className="px-5 py-3.5">Balance</th>
                  <th className="px-5 py-3.5">Due</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {loans.map((l, i) => (
                  <motion.tr
                    key={l._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-primary-50/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-semibold text-dark">
                      {l.memberId ? `${l.memberId.firstName} ${l.memberId.lastName}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm capitalize">{l.type}</td>
                    <td className="px-5 py-3.5 text-sm">{formatCurrency(l.amount)}</td>
                    <td className="px-5 py-3.5 text-sm">{formatCurrency(l.amountRepaid)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-dark">{formatCurrency(l.balance)}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{formatDate(l.dueDate)}</td>
                    <td className="px-5 py-3.5"><Badge status={l.status} /></td>
                    <td className="px-5 py-3.5">
                      {l.status === 'pending' && (
                        <Button size="sm" variant="outline-primary" onClick={() => approve(l._id)}>Approve</Button>
                      )}
                      {l.status === 'approved' && (
                        <Button size="sm" onClick={() => disburse(l._id)}>Disburse</Button>
                      )}
                    </td>
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
