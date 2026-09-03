import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
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
      <div className="rounded-xl border border-navy-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-navy-100" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <p className="p-10 text-center text-sm text-navy-400">No collections recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-navy-100">
              <thead>
                <tr className="bg-navy-50 text-left text-xs font-semibold uppercase text-navy-500">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Crop</th>
                  <th className="px-5 py-3">Qty</th>
                  <th className="px-5 py-3">Grade</th>
                  <th className="px-5 py-3">Total Value</th>
                  <th className="px-5 py-3">Captured By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {collections.map((c) => (
                  <tr key={c._id} className="hover:bg-brand-50/50">
                    <td className="px-5 py-3 text-sm text-navy-600">{formatDate(c.date)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-navy-900">
                      {c.memberId ? `${c.memberId.firstName} ${c.memberId.lastName}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-sm">{c.crop}</td>
                    <td className="px-5 py-3 text-sm">{c.quantity} {c.unit}</td>
                    <td className="px-5 py-3"><Badge status={c.qualityGrade} label={`Grade ${c.qualityGrade}`} /></td>
                    <td className="px-5 py-3 text-sm font-medium">{formatCurrency(c.totalValue)}</td>
                    <td className="px-5 py-3 text-sm text-navy-500">{c.capturedBy?.name || '—'}</td>
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