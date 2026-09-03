import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Upload, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import { MEMBER_STATUSES, CROPS } from '../utils/constants'
import { initials } from '../utils/format'

export default function Members() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ search: '', status: '', crop: '', location: '' })
  const [groups, setGroups] = useState([])

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v)
      })
      const { data } = await api.get(`/members?${params.toString()}`)
      setMembers(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  useEffect(() => {
    api.get('/groups').then(({ data }) => setGroups(data.data)).catch(() => {})
  }, [])

  const handleFilterChange = (key, value) => {
    setPage(1)
    setFilters((f) => ({ ...f, [key]: value }))
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v))
    const token = localStorage.getItem('token')
    window.open(`/api/members/export?${params.toString()}`, '_blank')
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${total} member${total === 1 ? '' : 's'} registered`}
        action={
          <>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.csv,.xlsx'
                input.onchange = async (e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  const fd = new FormData()
                  fd.append('file', file)
                  fd.append('organisationId', '')
                  try {
                    await api.post('/members/import', fd, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    })
                    loadMembers()
                  } catch (err) {
                    alert(err.response?.data?.message || 'Import failed')
                  }
                }
                input.click()
              }}
              variant="secondary"
            >
              <Upload className="h-4 w-4" /> Import
            </Button>
            <Button onClick={() => navigate('/members/new')}>
              <Plus className="h-4 w-4" /> Add Member
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-navy-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Input
            placeholder="Search name, phone, ID, membership..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          placeholder="All statuses"
          options={MEMBER_STATUSES}
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        />
        <Select
          placeholder="All crops"
          options={CROPS}
          value={filters.crop}
          onChange={(e) => handleFilterChange('crop', e.target.value)}
        />
        <Input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-navy-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-navy-100" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="p-10 text-center text-sm text-navy-400">
            No members found. Try adjusting your filters or add a new member.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-navy-100">
              <thead>
                <tr className="bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Membership No.</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Crops</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {members.map((m) => (
                  <tr
                    key={m._id}
                    onClick={() => navigate(`/members/${m._id}`)}
                    className="cursor-pointer transition-colors hover:bg-brand-50/50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {m.photo ? (
                          <img src={m.photo} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                            {initials(`${m.firstName} ${m.lastName}`)}
                          </div>
                        )}
                        <span className="font-medium text-navy-900">
                          {m.firstName} {m.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-navy-600">{m.membershipNumber}</td>
                    <td className="px-5 py-3 text-sm text-navy-600">{m.phone}</td>
                    <td className="px-5 py-3 text-sm text-navy-600">{m.location || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(m.mainCrops || []).slice(0, 2).map((c) => (
                          <span key={c} className="rounded bg-navy-100 px-1.5 py-0.5 text-xs text-navy-600">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-navy-100 px-5 py-3">
            <p className="text-sm text-navy-500">
              Showing page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}