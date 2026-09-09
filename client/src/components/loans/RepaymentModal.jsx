import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { formatCurrency } from '../../utils/format'

const dateInputValue = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const REPAYMENT_METHODS = [
  { value: 'deduction', label: 'Deduction (from harvest)' },
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
]

// Records a loan repayment against a disbursed/approved loan. Shows the
// outstanding balance and clears the form on submit.
export default function RepaymentModal({ open, loan, onClose, onSaved }) {
  const [form, setForm] = useState({ amount: '', method: 'deduction', date: dateInputValue(new Date()) })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ amount: loan?.balance || '', method: 'deduction', date: dateInputValue(new Date()) })
    }
  }, [open, loan])

  const amount = Number(form.amount) || 0
  const amountPaid = (loan?.amountRepaid || 0) + amount

  const submit = async () => {
    if (!amount || amount <= 0) {
      toast.error('Enter a valid repayment amount')
      return
    }
    setSaving(true)
    try {
      await api.post(`/loans/${loan._id}/repayment`, {
        amount,
        method: form.method,
        date: form.date || new Date(),
      })
      toast.success('Repayment recorded')
      onClose()
      if (onSaved) onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record repayment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Repayment"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>Record Repayment</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 rounded-xl border border-border bg-subtle/50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Outstanding balance</p>
          <p className="mt-0.5 text-lg font-bold text-dark">{formatCurrency(loan?.balance || 0)}</p>
        </div>
        <Input
          label="Amount (GHS) *"
          type="number"
          min="0"
          step="any"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
        />
        <Select
          label="Method"
          options={REPAYMENT_METHODS}
          value={form.method}
          onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
        />
        <Input
          label="Date *"
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
        <div className="sm:col-span-2 flex justify-between rounded-xl bg-primary-50 px-4 py-3">
          <span className="text-sm font-semibold text-primary">After this repayment</span>
          <span className="text-sm font-bold text-primary">{formatCurrency(amountPaid)} total repaid</span>
        </div>
      </div>
    </Modal>
  )
}