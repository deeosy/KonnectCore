import { useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
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
      <div className="rounded-xl border border-navy-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-navy-100" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <p className="p-10 text-center text-sm text-navy-400">No payments recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-navy-100">
              <thead>
                <tr className="bg-navy-50 text-left text-xs font-semibold uppercase text-navy-500">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-brand-50/50">
                    <td className="px-5 py-3 text-sm text-navy-600">{formatDate(p.paymentDate)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-navy-900">
                      {p.memberId ? `${p.memberId.firstName} ${p.memberId.lastName}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-sm capitalize">{p.type.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3 text-sm capitalize">{p.method.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3 text-sm font-medium">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3"><Badge status={p.status} /></td>
                    <td className="px-5 py-3 text-sm text-navy-500">{p.receiptNumber || '—'}</td>
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