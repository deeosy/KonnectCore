import { useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
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
      <div className="rounded-xl border border-navy-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-navy-100" />
            ))}
          </div>
        ) : loans.length === 0 ? (
          <p className="p-10 text-center text-sm text-navy-400">No loans recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-navy-100">
              <thead>
                <tr className="bg-navy-50 text-left text-xs font-semibold uppercase text-navy-500">
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Repaid</th>
                  <th className="px-5 py-3">Balance</th>
                  <th className="px-5 py-3">Due</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {loans.map((l) => (
                  <tr key={l._id} className="hover:bg-brand-50/50">
                    <td className="px-5 py-3 text-sm font-medium text-navy-900">
                      {l.memberId ? `${l.memberId.firstName} ${l.memberId.lastName}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-sm capitalize">{l.type}</td>
                    <td className="px-5 py-3 text-sm">{formatCurrency(l.amount)}</td>
                    <td className="px-5 py-3 text-sm">{formatCurrency(l.amountRepaid)}</td>
                    <td className="px-5 py-3 text-sm font-medium">{formatCurrency(l.balance)}</td>
                    <td className="px-5 py-3 text-sm text-navy-600">{formatDate(l.dueDate)}</td>
                    <td className="px-5 py-3"><Badge status={l.status} /></td>
                    <td className="px-5 py-3">
                      {l.status === 'pending' && (
                        <Button size="sm" variant="secondary" onClick={() => approve(l._id)}>Approve</Button>
                      )}
                      {l.status === 'approved' && (
                        <Button size="sm" onClick={() => disburse(l._id)}>Disburse</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}