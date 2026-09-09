import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, AlertTriangle, HandCoins, CircleDollarSign, CheckCheck, Wallet } from 'lucide-react'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import LoanRequestModal from '../components/loans/LoanRequestModal'
import { LOAN_TYPES, LOAN_STATUSES } from '../utils/constants'
import { formatCurrency, formatDate } from '../utils/format'

export default function LoansPage() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', type: '', search: '' })
  const [requestOpen, setRequestOpen] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/loans')
      .then(({ data }) => setLoans(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const approve = async (id) => {
    if (!window.confirm('Approve this loan?')) return
    try {
      await api.put(`/loans/${id}/approve`)
      toast.success('Loan approved')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve loan')
    }
  }

  const disburse = async (id) => {
    if (!window.confirm('Disburse this loan now?')) return
    try {
      await api.put(`/loans/${id}/disburse`)
      toast.success('Loan disbursed')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disburse loan')
    }
  }

  const checkOverdue = async () => {
    try {
      const { data } = await api.get('/loans/overdue')
      toast[data.count > 0 ? 'warning' : 'success'](
        data.count > 0 ? `${data.count} loan(s) marked overdue` : 'No overdue loans',
      )
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check overdue loans')
    }
  }

  const filtered = useMemo(() => {
    let list = loans
    if (filters.status) list = list.filter((l) => l.status === filters.status)
    if (filters.type) list = list.filter((l) => l.type === filters.type)
    if (filters.search) {
      const s = filters.search.toLowerCase()
      list = list.filter((l) =>
        `${l.memberId?.firstName || ''} ${l.memberId?.lastName || ''} ${l.memberId?.membershipNumber || ''}`
          .toLowerCase()
          .includes(s),
      )
    }
    return list
  }, [loans, filters])

  const active = loans.filter((l) => !['rejected', 'completed'].includes(l.status))
  const stats = {
    lent: active.reduce((s, l) => s + (l.amount || 0), 0),
    outstanding: active.reduce((s, l) => s + (l.balance || 0), 0),
    completed: loans.filter((l) => l.status === 'completed').length,
    overdue: loans.filter((l) => l.status === 'overdue').reduce((s, l) => s + (l.balance || 0), 0),
    overdueCount: loans.filter((l) => l.status === 'overdue').length,
  }

  return (
    <div>
      <PageHeader
        title="Loan Management"
        subtitle="Loan requests, disbursements and repayments"
        action={
          <>
            <Button variant="outline-danger" onClick={checkOverdue}>
              <AlertTriangle className="h-4 w-4" />
              Check Overdue
            </Button>
            <Button onClick={() => setRequestOpen(true)}>
              <Plus className="h-4 w-4" />
              Request Loan
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CircleDollarSign} label="Total lent (active)" value={formatCurrency(stats.lent)} accent="primary" sub={`${active.length} loans`} />
        <StatCard icon={Wallet} label="Outstanding balance" value={formatCurrency(stats.outstanding)} accent="info" sub="To be collected" />
        <StatCard icon={CheckCheck} label="Completed loans" value={String(stats.completed)} accent="success" sub="Fully repaid" />
        <StatCard icon={AlertTriangle} label="Overdue" value={formatCurrency(stats.overdue)} accent="danger" sub={`${stats.overdueCount} loans`} />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Select
          label="Status"
          options={[{ value: '', label: 'All statuses' }, ...LOAN_STATUSES]}
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        />
        <Select
          label="Type"
          options={[{ value: '', label: 'All types' }, ...LOAN_TYPES]}
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        />
        <Input
          label="Search member"
          placeholder="Name or membership number…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse-soft rounded-xl bg-subtle" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No loans found" description="Request the first loan to begin lending." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light">
              <thead>
                <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Rate</th>
                  <th className="px-5 py-3.5">Repaid</th>
                  <th className="px-5 py-3.5">Balance</th>
                  <th className="px-5 py-3.5">Due</th>
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filtered.map((l, i) => (
                  <motion.tr
                    key={l._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-primary-50/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      {l.memberId?._id ? (
                        <Link to={`/members/${l.memberId._id}`} className="text-sm font-semibold text-dark hover:text-primary">
                          {l.memberId.firstName} {l.memberId.lastName}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm capitalize">{l.type} loan</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-dark">{formatCurrency(l.amount)}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{l.interestRate ? `${l.interestRate}%` : '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{formatCurrency(l.amountRepaid)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-dark">{formatCurrency(l.balance)}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{formatDate(l.dueDate)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-bold ${l.creditScore >= 50 ? 'text-success' : l.creditScore >= 30 ? 'text-warning-600' : 'text-danger'}`}>
                        {l.creditScore}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><Badge status={l.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/loans/${l._id}`} className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-50">
                          View
                        </Link>
                        {l.status === 'pending' && (
                          <button onClick={() => approve(l._id)} className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-50">
                            Approve
                          </button>
                        )}
                        {l.status === 'approved' && (
                          <button onClick={() => disburse(l._id)} className="rounded-lg px-2 py-1 text-xs font-semibold text-secondary transition-colors hover:bg-info-50">
                            Disburse
                          </button>
                        )}
                        {l.status === 'overdue' && (
                          <Link to={`/loans/${l._id}`} className="rounded-lg px-2 py-1 text-xs font-semibold text-danger transition-colors hover:bg-danger-50">
                            Repay
                          </Link>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LoanRequestModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        onSaved={load}
      />
    </div>
  )
}