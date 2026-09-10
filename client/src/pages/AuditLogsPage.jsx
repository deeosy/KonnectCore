import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ScrollText,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import DataTable from '../components/ui/DataTable'
import api from '../services/api'
import { formatDateTime } from '../utils/format'

const ACTIONS = [
  'create',
  'update',
  'delete',
  'approve',
  'disburse',
  'repayment',
  'record',
  'assign',
  'import',
  'auto_deduct',
  'login',
  'register',
].map((a) => ({ value: a, label: a.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) }))

const RESOURCES = [
  'member',
  'group',
  'collection',
  'payment',
  'loan',
  'expense',
  'visit',
  'task',
  'user',
  'organisation',
  'organisation_settings',
  'batch',
  'auth',
].map((r) => ({ value: r, label: r.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) }))

const columns = [
  {
    header: 'Date / Time',
    accessor: null,
    render: (r) => <span className="whitespace-nowrap">{formatDateTime(r.createdAt)}</span>,
  },
  {
    header: 'User',
    accessor: null,
    render: (r) =>
      r.user ? (
        <div>
          <p className="font-medium text-dark">{r.user.name || r.user.email}</p>
          <p className="text-xs text-muted">{r.user.role}</p>
        </div>
      ) : (
        <span className="text-muted">—</span>
      ),
  },
  {
    header: 'Action',
    accessor: null,
    render: (r) => (
      <span className="capitalize">{r.action.replace(/_/g, ' ')}</span>
    ),
  },
  {
    header: 'Resource',
    accessor: null,
    render: (r) => (
      <span className="capitalize">{r.resource.replace(/_/g, ' ')}</span>
    ),
  },
  { header: 'Summary', accessor: 'summary' },
  { header: 'IP Address', accessor: 'ip' },
  {
    header: 'Result',
    accessor: null,
    render: (r) => (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
          r.success ? 'bg-success-50 text-success' : 'bg-danger-50 text-danger'
        }`}
      >
        {r.success ? 'Success' : 'Failed'}
      </span>
    ),
  },
]

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({ action: '', resource: '', user: '', from: '', to: '' })
  const [logs, setLogs] = useState(null)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let stale = false
    const params = new URLSearchParams({ page: String(page), limit: '15' })
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v))
    api
      .get(`/audit-logs${params.toString() ? `?${params}` : ''}`)
      .then(({ data }) => {
        if (stale) return
        setLogs(data.data || [])
        setPages(data.pages || 1)
        setTotal(data.total || 0)
      })
      .catch((err) => {
        if (!stale) toast.error(err.response?.data?.message || 'Failed to load audit logs')
      })
      .finally(() => !stale && setLoading(false))
    return () => {
      stale = true
    }
  }, [filters, page])

  const setFilter = (key, value) => {
    setLoading(true)
    setPage(1)
    setFilters((f) => ({ ...f, [key]: value }))
  }

  const clearFilters = () => {
    setLoading(true)
    setPage(1)
    setFilters({ action: '', resource: '', user: '', from: '', to: '' })
  }

  const exportCsv = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({ format: 'csv', limit: '1000' })
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v))
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'audit-logs.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Track who did what across the system"
        action={
          <Button variant="outline" onClick={exportCsv} loading={exporting}>
            <FileDown className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <Card className="mb-6" icon={<Filter className="h-5 w-5" />} title="Filters" subtitle={`${total} log entries`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Action"
            placeholder="All actions"
            options={ACTIONS}
            value={filters.action}
            onChange={(e) => setFilter('action', e.target.value || '')}
          />
          <Select
            label="Resource"
            placeholder="All resources"
            options={RESOURCES}
            value={filters.resource}
            onChange={(e) => setFilter('resource', e.target.value || '')}
          />
          <Input
            label="User"
            placeholder="Search by name or email"
            value={filters.user}
            onChange={(e) => setFilter('user', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="From" type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
            <Input label="To" type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full">
              <RotateCcw className="h-4 w-4" /> Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="-mx-6 -mb-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted">
              Loading audit trail...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={logs || []}
              emptyTitle="No audit entries"
              emptyDescription="Activity will appear here as changes are made across the system."
            />
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Page {page} of {pages} · {total} entries
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => {
              setLoading(true)
              setPage((p) => p - 1)
            }}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button
            variant="outline"
            disabled={page >= pages}
            onClick={() => {
              setLoading(true)
              setPage((p) => p + 1)
            }}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted">
        <ScrollText className="h-4 w-4" />
        Audit trail is append-only and cannot be edited or deleted.
      </div>
    </div>
  )
}