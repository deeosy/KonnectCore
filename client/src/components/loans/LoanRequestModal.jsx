import { useEffect, useRef, useState } from 'react'
import { Search, User, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { LOAN_TYPES } from '../../utils/constants'
import { formatCurrency } from '../../utils/format'

// Shared "Request Loan" form used on the Loans page and the member profile
// (so field officers have a UI for it too). The backend computes a deterministic
// credit score at request time from collection history, completed loans and
// overdue loans — displayed here for transparency.
export default function LoanRequestModal({ open, onClose, onSaved, member }) {
  const [form, setForm] = useState({
    memberId: '',
    type: 'cash',
    amount: '',
    interestRate: '0',
    interestType: 'flat',
    durationMonths: '3',
    dueDate: '',
    purpose: '',
  })
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState([])
  const [pickedMember, setPickedMember] = useState(null)
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const searchTimer = useRef(null)

  const presetMemberName = member ? `${member.firstName} ${member.lastName}` : ''

  useEffect(() => {
    if (!open) return
    setForm({
      memberId: member?._id || '',
      type: 'cash',
      amount: '',
      interestRate: '0',
      interestType: 'flat',
      durationMonths: '3',
      dueDate: '',
      purpose: '',
    })
    setMemberSearch('')
    setMemberResults([])
    setPickedMember(member || null)
  }, [open, member])

  const searchMembers = (term) => {
    setMemberSearch(term)
    clearTimeout(searchTimer.current)
    if (!term.trim()) {
      setMemberResults([])
      return
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await api.get(`/members?search=${encodeURIComponent(term)}&limit=6`)
        setMemberResults(data.data || [])
      } catch {
        setMemberResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
  }

  const amount = Number(form.amount) || 0
  const rate = Number(form.interestRate) || 0
  const interest = form.interestType === 'reducing_balance'
    ? amount * (rate / 100) * ((Number(form.durationMonths) || 1) / 12)
    : amount * (rate / 100)
  const totalRepayable = Math.round(amount + interest)

  const submit = async () => {
    if (!form.memberId || !form.amount || Number(form.amount) <= 0) {
      toast.error('Select a member and enter a valid amount')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.post('/loans', {
        memberId: form.memberId,
        type: form.type,
        amount: amount,
        interestRate: rate,
        interestType: form.interestType,
        durationMonths: Number(form.durationMonths) || 3,
        dueDate: form.dueDate || undefined,
        purpose: form.purpose || undefined,
      })
      toast.success(`Loan requested — credit score ${data.data.creditScore}`)
      onClose()
      if (onSaved) onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request loan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request Loan"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>Submit Request</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {presetMemberName ? (
          <div className="sm:col-span-2 rounded-xl border border-border bg-subtle/50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Member</p>
            <p className="mt-0.5 text-sm font-bold text-dark">{presetMemberName}</p>
          </div>
        ) : (
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-dark">Member *</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
              <input
                value={memberSearch}
                onChange={(e) => searchMembers(e.target.value)}
                placeholder="Search member by name or phone…"
                className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-dark outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary-100"
              />
            </div>
            {searching && <p className="mt-1.5 text-xs text-muted">Searching…</p>}
            {memberResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-border">
                {memberResults.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => {
                      setForm((f) => ({ ...f, memberId: m._id }))
                      setPickedMember(m)
                      setMemberSearch('')
                      setMemberResults([])
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50"
                  >
                    <User className="h-4 w-4 text-muted" />
                    <span className="font-semibold text-dark">{m.firstName} {m.lastName}</span>
                    <span className="ml-auto text-xs text-muted">{m.membershipNumber || m.phone}</span>
                  </button>
                ))}
              </div>
            )}
            {form.memberId && pickedMember && !memberSearch && (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {pickedMember.firstName} {pickedMember.lastName}
                </span>
                <span className="ml-auto text-xs text-muted">
                  {pickedMember.membershipNumber || pickedMember.phone}
                </span>
              </div>
            )}
          </div>
        )}

        <Select
          label="Loan type *"
          options={LOAN_TYPES}
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
        />
        <Input
          label="Amount (GHS) *"
          type="number"
          min="0"
          step="any"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
        />
        <Input
          label="Interest rate (%)"
          type="number"
          min="0"
          step="any"
          value={form.interestRate}
          onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))}
          hint="0 for interest-free"
        />
        <Select
          label="Interest model"
          options={[
            { value: 'flat', label: 'Flat (one-off on principal)' },
            { value: 'reducing_balance', label: 'Simple (pro-rated to term)' },
          ]}
          value={form.interestType}
          onChange={(e) => setForm((f) => ({ ...f, interestType: e.target.value }))}
        />
        <Input
          label="Duration (months)"
          type="number"
          min="1"
          value={form.durationMonths}
          onChange={(e) => setForm((f) => ({ ...f, durationMonths: e.target.value }))}
        />
        <Input
          label="Due date"
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          hint="Leave blank to auto-set from duration at disbursal"
        />
        <div className="sm:col-span-2">
          <Input
            label="Purpose"
            value={form.purpose}
            onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
            placeholder="e.g. buy fertilizer, school fees…"
          />
        </div>

        <div className="sm:col-span-2 flex justify-between rounded-xl bg-primary-50 px-4 py-3">
          <span className="text-sm font-semibold text-primary">Total repayable</span>
          <span className="text-sm font-bold text-primary">{formatCurrency(totalRepayable)}</span>
        </div>
        <div className="sm:col-span-2 flex items-start gap-2 rounded-xl bg-subtle px-4 py-3 text-xs text-muted">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            A credit score is calculated at request time: up to 60 pts for cumulative produce delivered, up to
            20 pts for completed loans, minus 15 pts per overdue loan.
          </span>
        </div>
      </div>
    </Modal>
  )
}