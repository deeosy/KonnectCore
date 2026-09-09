import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Wallet, TrendingUp, TrendingDown, ArrowDownToLine, Trash2, RefreshCw } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import PaymentModal from '../components/payments/PaymentModal'
import { PAYMENT_TYPES, PAYMENT_STATUSES } from '../utils/constants'
import { formatCurrency, formatDate } from '../utils/format'

const TYPE_COLOR = {
  produce_payment: 'text-primary',
  dues: 'text-secondary',
  contribution: 'text-success',
  savings: 'text-warning-600',
  expense: 'text-danger',
}

const gatewayBadge = (p) => {
  if (p.gateway !== 'hubtel') return null
  const map = { success: 'paid', pending: 'pending', failed: 'cancelled' }
  const label = p.simulated ? `Sim · ${p.gatewayStatus || 'success'}` : `Hubtel · ${p.gatewayStatus || 'pending'}`
  return { status: map[p.gatewayStatus] || 'pending', label }
}

export default function PaymentsPage() {
  const { hasRole } = useAuth()
  const [tab, setTab] = useState('all')
  const [payments, setPayments] = useState([])
  const [outstanding, setOutstanding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', type: '', search: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPrefill, setModalPrefill] = useState(null)
  const searchTimer = useRef(null)

  const fetchPayments = useCallback(() => {
    const params = new URLSearchParams({ limit: '100' })
    if (filters.status) params.set('status', filters.status)
    if (filters.type) params.set('type', filters.type)
    if (filters.search) params.set('search', filters.search)
    api.get(`/payments?${params}`)
      .then(({ data }) => setPayments(data.data))
      .catch(console.error)
  }, [filters])

  const fetchOutstanding = useCallback(() => {
    api.get('/payments/outstanding')
      .then(({ data }) => setOutstanding(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchPayments(), fetchOutstanding()])
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [fetchPayments, fetchOutstanding])

  const searchDebounced = (value) => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value }))
    }, 350)
  }

  const openRecord = (prefill = null) => {
    setModalPrefill(prefill)
    setModalOpen(true)
  }

  const remove = async (p) => {
    if (!window.confirm('Delete this payment record?')) return
    try {
      await api.delete(`/payments/${p._id}`)
      toast.success('Payment deleted')
      fetchPayments()
      fetchOutstanding()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete payment')
    }
  }

  const refreshGateway = async (p) => {
    try {
      const { data } = await api.get(`/payments/${p._id}/status`)
      toast.success(data.gateway === 'hubtel' ? 'Gateway status checked' : 'No gateway on this payment')
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check status')
    }
  }

  const totals = payments.reduce(
    (acc, p) => {
      if (p.status === 'cancelled') return acc
      const paid = p.amountPaid || 0
      if (['dues', 'contribution', 'savings'].includes(p.type)) acc.received += paid
      if (p.type === 'produce_payment') acc.paidOut += paid
      if (p.method === 'mobile_money') acc.momo += paid
      acc.all += paid
      return acc
    },
    { received: 0, paidOut: 0, momo: 0, all: 0 },
  )

  return (
    <div>
      <PageHeader
        title="Payments & Dues"
        subtitle="Record dues, contributions, savings and produce payouts"
        action={
          <Button onClick={() => openRecord()}>
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-border bg-surface p-1">
        {[
          { key: 'all', label: 'All Payments' },
          { key: 'outstanding', label: 'Outstanding Dues' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key ? 'bg-dark text-white' : 'text-muted hover:bg-subtle hover:text-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'all' ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={ArrowDownToLine} label="Collected (momo + cash)" value={formatCurrency(totals.received)} accent="success" sub="Dues · contributions · savings" />
            <StatCard icon={TrendingUp} label="Paid out to members" value={formatCurrency(totals.paidOut)} accent="primary" sub="Produce payments" />
            <StatCard icon={Wallet} label="Mobile money volume" value={formatCurrency(totals.momo)} accent="info" sub="Via Hubtel gateway" />
            <StatCard icon={TrendingDown} label="Outstanding dues" value={formatCurrency(outstanding?.totalOutstanding || 0)} accent="warning" sub={`${outstanding?.count || 0} members`} />
          </div>

          {/* Filters */}
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Select
              label="Status"
              options={[{ value: '', label: 'All statuses' }, ...PAYMENT_STATUSES]}
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            />
            <Select
              label="Type"
              options={[{ value: '', label: 'All types' }, ...PAYMENT_TYPES]}
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            />
            <Input
              label="Search member"
              placeholder="Name or membership number…"
              value={filters.search}
              onChange={(e) => searchDebounced(e.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse-soft rounded-xl bg-subtle" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <EmptyState title="No payments recorded yet" description="Record the first payment to see it here." />
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
                      <th className="px-5 py-3.5">Gateway</th>
                      <th className="px-5 py-3.5">Receipt</th>
                      <th className="px-5 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {payments.map((p, i) => {
                      const gb = gatewayBadge(p)
                      return (
                        <motion.tr
                          key={p._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-primary-50/30 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-sm text-muted">{formatDate(p.paymentDate)}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-dark">
                            {p.memberId?._id ? (
                              <Link to={`/members/${p.memberId._id}`} className="hover:text-primary">
                                {p.memberId.firstName} {p.memberId.lastName}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className={`px-5 py-3.5 text-sm capitalize ${TYPE_COLOR[p.type] || 'text-muted'}`}>
                            {p.type.replace(/_/g, ' ')}
                          </td>
                          <td className="px-5 py-3.5 text-sm capitalize text-muted">{p.method.replace(/_/g, ' ')}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-dark">{formatCurrency(p.amount)}</td>
                          <td className="px-5 py-3.5"><Badge status={p.status} /></td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {gb ? <Badge status={gb.status} label={gb.label} /> : <span className="text-xs text-muted/60">—</span>}
                              {p.gateway === 'hubtel' && !p.simulated && (
                                <button onClick={() => refreshGateway(p)} title="Check gateway status" className="text-muted transition-colors hover:text-primary">
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-muted">{p.receiptNumber || '—'}</td>
                          <td className="px-5 py-3.5 text-right">
                            {hasRole('admin') && (
                              <button onClick={() => remove(p)} className="text-muted transition-colors hover:text-danger" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse-soft rounded-xl bg-subtle" />
              ))}
            </div>
          ) : !outstanding?.data?.length ? (
            <EmptyState title="Nobody owes dues" description="All members have fully-settled membership dues." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light">
                <thead>
                  <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="px-5 py-3.5">Member</th>
                    <th className="px-5 py-3.5">Total due</th>
                    <th className="px-5 py-3.5">Paid</th>
                    <th className="px-5 py-3.5">Outstanding</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {outstanding.data.map((row, i) => (
                    <motion.tr
                      key={row.member._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-primary-50/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <Link to={`/members/${row.member._id}`} className="text-sm font-semibold text-dark hover:text-primary">
                          {row.member.firstName} {row.member.lastName}
                        </Link>
                        <p className="text-xs text-muted">{row.member.membershipNumber || row.member.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted">{formatCurrency(row.totalDues)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-success">{formatCurrency(row.paid)}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-danger">{formatCurrency(row.outstanding)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            openRecord({
                              memberId: row.member._id,
                              memberName: `${row.member.firstName} ${row.member.lastName}`,
                              type: 'dues',
                              amount: row.outstanding,
                              amountPaid: row.outstanding,
                            })
                          }
                        >
                          Record payment
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          fetchPayments()
          fetchOutstanding()
        }}
        member={modalPrefill?.member}
        initial={modalPrefill}
      />
    </div>
  )
}