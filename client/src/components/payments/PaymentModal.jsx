import { useEffect, useRef, useState } from 'react'
import { Search, User } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { PAYMENT_TYPES, PAYMENT_METHODS } from '../../utils/constants'
import { formatCurrency } from '../../utils/format'

const dateInputValue = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const DIRECTION_HINT = {
  dues: 'Collected from the member via Hubtel (receive).',
  contribution: 'Collected from the member via Hubtel (receive).',
  savings: 'Collected from the member via Hubtel (receive).',
  produce_payment: 'Payout from the coop to the member via Hubtel (send).',
}

const MOMO_CHANNELS = [
  { value: 'mtn-gh', label: 'MTN Mobile Money' },
  { value: 'vodafone-gh', label: 'Vodafone Cash / Telecel' },
  { value: 'airtel-gh', label: 'AirtelTigo Money' },
]

// Shared "Record Payment" form used on the Payments page, the Outstanding Dues
// tab and (with a preset member) from the member profile. Supports back-dating
// and mobile money via the Hubtel gateway (simulated when no Hubtel credentials
// are configured).
export default function PaymentModal({ open, onClose, onSaved, member, initial }) {
  const [form, setForm] = useState({
    memberId: '',
    type: 'dues',
    amount: '',
    amountPaid: '',
    method: 'cash',
    paymentDate: dateInputValue(new Date()),
    referenceNumber: '',
    description: '',
    msisdn: '',
    channel: 'mtn-gh',
  })
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState([])
  const [pickedMember, setPickedMember] = useState(null)
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const searchTimer = useRef(null)

  const presetMember = member || (initial?.memberId ? { _id: initial.memberId } : null)
  const presetMemberName =
    member
      ? `${member.firstName} ${member.lastName}`
      : initial?.memberName || ''

  // Reset the form on every open.
  useEffect(() => {
    if (!open) return
    setForm({
      memberId: presetMember?._id || '',
      type: initial?.type || 'dues',
      amount: initial?.amount ?? '',
      amountPaid: initial?.amountPaid ?? '',
      method: initial?.method || 'cash',
      paymentDate: initial?.paymentDate
        ? dateInputValue(initial.paymentDate)
        : dateInputValue(new Date()),
      referenceNumber: initial?.referenceNumber || '',
      description: initial?.description || '',
      msisdn: initial?.msisdn || member?.phone || '',
      channel: 'mtn-gh',
    })
    setMemberSearch('')
    setMemberResults([])
    setPickedMember(member || (initial?.memberId ? { _id: initial.memberId, ...(initial.memberName ? { firstName: initial.memberName } : {}) } : null))
  }, [open, member, initial])

  const needsGateway =
    form.method === 'mobile_money' &&
    ['dues', 'contribution', 'savings', 'produce_payment'].includes(form.type)

  const direction = form.type === 'produce_payment' ? 'out' : 'in'

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

  const selectedMember = memberResults.find((m) => m._id === form.memberId)
  const amount = Number(form.amount) || 0
  const amountPaid = form.amountPaid === '' ? amount : Number(form.amountPaid) || 0
  const status = amountPaid >= amount && amount > 0 ? 'paid' : amountPaid > 0 ? 'part_paid' : 'pending'

  const submit = async () => {
    if (!form.memberId || !form.amount) {
      toast.error('Select a member and enter an amount')
      return
    }
    setSaving(true)
    try {
      const payload = {
        memberId: form.memberId,
        type: form.type,
        amount: amount,
        amountPaid,
        method: form.method,
        paymentDate: form.paymentDate || new Date(),
        referenceNumber: form.referenceNumber || undefined,
        description: form.description || undefined,
        ...(needsGateway ? { msisdn: form.msisdn || undefined, channel: form.channel } : {}),
      }
      await api.post('/payments', payload)
      toast.success(
        needsGateway && direction === 'in'
          ? 'Payment recorded — mobile money request initiated'
          : 'Payment recorded',
      )
      onClose()
      if (onSaved) onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Payment"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            Record Payment
          </Button>
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
                      setForm((f) => ({ ...f, memberId: m._id, msisdn: f.msisdn || m.phone || '' }))
                      setPickedMember(m)
                      setMemberSearch('')
                      setMemberResults([])
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 ${selectedMember?._id === m._id ? 'bg-primary-50' : ''}`}
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
            {form.memberId && !memberSearch && !pickedMember && (
              <p className="mt-1.5 text-xs font-medium text-primary">Selected — search again to change</p>
            )}
          </div>
        )}

        <Select
          label="Type *"
          options={PAYMENT_TYPES}
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
        />
        <Select
          label="Method *"
          options={PAYMENT_METHODS}
          value={form.method}
          onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
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
          label="Amount paid"
          type="number"
          min="0"
          step="any"
          value={form.amountPaid}
          onChange={(e) => setForm((f) => ({ ...f, amountPaid: e.target.value }))}
          hint="Leave blank to settle the full amount"
        />

        <Input
          label="Payment date *"
          type="date"
          value={form.paymentDate}
          onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
          hint="Defaults to today; pick an earlier date to back-date"
        />
        <Input
          label="Reference"
          value={form.referenceNumber}
          onChange={(e) => setForm((f) => ({ ...f, referenceNumber: e.target.value }))}
          hint="Optional external reference"
        />

        {needsGateway && (
          <>
            <Input
              label="Mobile money number *"
              value={form.msisdn}
              onChange={(e) => setForm((f) => ({ ...f, msisdn: e.target.value }))}
              hint={member?.phone ? `Member's phone on file: ${member.phone}` : 'Member phone, e.g. 0244 123 456'}
            />
            <Select
              label="Network"
              options={MOMO_CHANNELS}
              value={form.channel}
              onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
            />
            <div className={`sm:col-span-2 rounded-xl px-4 py-3 text-xs ${direction === 'out' ? 'bg-warning-50 text-warning-600' : 'bg-primary-50 text-primary'}`}>
              <span className="font-semibold">Hubtel {direction === 'out' ? 'send' : 'receive'}: </span>
              {DIRECTION_HINT[form.type]} In demo mode (no Hubtel credentials) this is simulated and marked as such.
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            hint="Optional note on the payment"
          />
        </div>

        <div className="sm:col-span-2 flex justify-between rounded-xl bg-primary-50 px-4 py-3">
          <span className="text-sm font-semibold text-primary">Payable / Paid</span>
          <span className="text-sm font-bold text-primary">
            {formatCurrency(amount)} / {formatCurrency(amountPaid)}{' '}
            <span className="font-semibold capitalize">({status.replace(/_/g, ' ')})</span>
          </span>
        </div>
      </div>
    </Modal>
  )
}