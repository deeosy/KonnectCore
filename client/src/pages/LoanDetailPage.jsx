import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Check, Coins, Send, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import RepaymentModal from '../components/loans/RepaymentModal'
import { formatCurrency, formatDate, formatDateTime } from '../utils/format'

function computeTotalRepayable(loan) {
  const amount = loan.amount || 0
  const rate = loan.interestRate || 0
  if (!rate) return amount
  if (loan.interestType === 'reducing_balance') {
    return Math.round(amount + amount * (rate / 100) * ((loan.durationMonths || 1) / 12))
  }
  return Math.round(amount + amount * (rate / 100))
}

export default function LoanDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loan, setLoan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [repayOpen, setRepayOpen] = useState(false)
  const [deductOpen, setDeductOpen] = useState(false)
  const [deductVal, setDeductVal] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get(`/loans/${id}`)
      .then(({ data }) => setLoan(data.data))
      .catch(() => toast.error('Failed to load loan'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const approve = async () => {
    if (!window.confirm('Approve this loan?')) return
    try {
      await api.put(`/loans/${id}/approve`)
      toast.success('Loan approved')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve loan')
    }
  }

  const disburse = async () => {
    if (!window.confirm('Disburse this loan now?')) return
    try {
      await api.put(`/loans/${id}/disburse`)
      toast.success('Loan disbursed')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disburse loan')
    }
  }

  const autoDeduct = async () => {
    const produceValue = Number(deductVal)
    if (!produceValue || produceValue <= 0) {
      toast.error('Enter the produce value')
      return
    }
    try {
      const { data } = await api.post('/loans/auto-deduct', { memberId: loan.memberId._id, produceValue })
      const total = data.data.reduce((s, r) => s + (r.deducted || 0), 0)
      toast.success(`Deducted ${formatCurrency(total)} across loans`)
      setDeductOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Auto-deduction failed')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse-soft rounded-xl bg-subtle" />
        <div className="h-48 animate-pulse-soft rounded-3xl bg-subtle" />
      </div>
    )
  }

  if (!loan) {
    return (
      <div>
        <Link to="/loans" className="mb-4 flex items-center gap-2 text-sm font-medium text-muted hover:text-dark">
          <ArrowLeft className="h-4 w-4" /> Back to Loans
        </Link>
        <p className="text-muted">Loan not found</p>
      </div>
    )
  }

  const totalRepayable = computeTotalRepayable(loan)
  const isPastDue = loan.dueDate && new Date(loan.dueDate) < new Date()
  const canDisburse = loan.status === 'approved'
  const canApprove = loan.status === 'pending'
  const canRepay = ['approved', 'disbursed', 'overdue'].includes(loan.status)
  const canDeduct = ['approved', 'disbursed', 'overdue'].includes(loan.status)

  return (
    <div>
      <Link to="/loans" className="mb-4 flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-dark">
        <ArrowLeft className="h-4 w-4" /> Back to Loans
      </Link>

      {/* Overdue banner */}
      {loan.status === 'overdue' && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          <AlertTriangle className="h-5 w-5" />
          <span>
            This loan is <strong>overdue</strong> — record a repayment to settle it.
          </span>
        </div>
      )}
      {loan.status !== 'overdue' && isPastDue && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
          <AlertTriangle className="h-5 w-5" />
          <span>Due date has passed. Run "Check Overdue" on the Loans page, or record a repayment.</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {loan.memberId?._id && (
            <Link to={`/members/${loan.memberId._id}`}>
              <Avatar name={`${loan.memberId.firstName} ${loan.memberId.lastName}`} size="xl" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-dark capitalize">
              {loan.type} Loan
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge status={loan.status} />
              <span className="text-sm text-muted">
                {loan.memberId ? `${loan.memberId.firstName} ${loan.memberId.lastName}` : '—'} · #{loan.memberId?.membershipNumber || ''}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Credit score {loan.creditScore}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canDisburse && (
            <Button onClick={disburse}>
              <Send className="h-4 w-4" /> Disburse
            </Button>
          )}
          {canApprove && (
            <Button onClick={approve}>
              <Check className="h-4 w-4" /> Approve
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary */}
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-base font-bold text-dark">Summary</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            {[
              { label: 'Amount', value: formatCurrency(loan.amount), bold: true },
              { label: 'Interest', value: loan.interestRate ? `${loan.interestRate}% (${loan.interestType.replace(/_/g, ' ')})` : '—' },
              { label: 'Total repayable', value: formatCurrency(totalRepayable), bold: true },
              { label: 'Repaid', value: formatCurrency(loan.amountRepaid) },
              { label: 'Balance', value: formatCurrency(loan.balance), bold: true },
              { label: 'Duration', value: `${loan.durationMonths ?? '—'} months` },
              { label: 'Due date', value: formatDate(loan.dueDate) },
              { label: 'Requested', value: formatDateTime(loan.createdAt) },
              { label: 'Requested by', value: loan.requestedBy?.name || '—' },
              { label: 'Approved', value: loan.approvedAt ? formatDateTime(loan.approvedAt) : '—' },
              { label: 'Approved by', value: loan.approvedBy?.name || '—' },
              { label: 'Disbursed', value: loan.disbursedAt ? formatDate(loan.disbursedAt) : '—' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
                <p className={`mt-0.5 ${item.bold ? 'font-bold text-dark' : 'font-semibold text-dark'}`}>{item.value}</p>
              </div>
            ))}
          </div>
          {loan.purpose && (
            <div className="mt-4 rounded-xl bg-subtle p-3 text-sm text-muted">
              <span className="font-semibold text-dark">Purpose:</span> {loan.purpose}
            </div>
          )}
          {loan.notes && (
            <div className="mt-2 rounded-xl bg-subtle p-3 text-sm text-muted">
              <span className="font-semibold text-dark">Notes:</span> {loan.notes}
            </div>
          )}
        </Card>

        {/* Actions / repayment */}
        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 text-base font-bold text-dark">Repayment</h3>
            <div className="mb-3 rounded-xl bg-primary-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Outstanding</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(loan.balance)}</p>
            </div>
            <div className="space-y-2">
              {canRepay && (
                <Button className="w-full" onClick={() => setRepayOpen(true)}>
                  <Coins className="h-4 w-4" /> Record Repayment
                </Button>
              )}
              {canDeduct && (
                <Button variant="outline" className="w-full" onClick={() => setDeductOpen(true)}>
                  Auto-deduct from harvest
                </Button>
              )}
            </div>
          </Card>

          {loan.creditHistory?.length > 0 && (
            <Card>
              <h3 className="mb-3 text-base font-bold text-dark">Credit history</h3>
              <ul className="space-y-2 text-sm">
                {loan.creditHistory.map((h, i) => (
                  <li key={i} className="flex justify-between border-b border-border-light pb-2">
                    <span className="text-muted">{h.event}</span>
                    <span className="font-semibold text-dark">{formatDate(h.date)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* Repayment timeline */}
      <Card className="mt-6">
        <h3 className="mb-4 text-base font-bold text-dark">Repayment Schedule</h3>
        {loan.repaymentSchedule?.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">No repayments recorded yet</p>
        ) : (
          <div className="space-y-3">
            {loan.repaymentSchedule.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
                    <Coins className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-dark">{formatCurrency(r.amount)}</p>
                    <p className="text-xs capitalize text-muted">
                      {r.method.replace(/_/g, ' ')} · {formatDateTime(r.date)}
                    </p>
                  </div>
                </div>
                {r.recordedBy?.name && (
                  <span className="text-xs text-muted">by {r.recordedBy.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <RepaymentModal open={repayOpen} loan={loan} onClose={() => setRepayOpen(false)} onSaved={load} />

      <Modal
        open={deductOpen}
        onClose={() => setDeductOpen(false)}
        title="Auto-deduct from Harvest"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeductOpen(false)}>Cancel</Button>
            <Button onClick={autoDeduct}>Deduct</Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-muted">
          Enter the value of the member's latest produce delivery. Up to <strong>30%</strong> of it will be
          deducted against each active loan, recorded as a "deduction" repayment.
        </p>
        <Input
          label="Produce value (GHS)"
          type="number"
          min="0"
          step="any"
          value={deductVal}
          onChange={(e) => setDeductVal(e.target.value)}
        />
      </Modal>
    </div>
  )
}