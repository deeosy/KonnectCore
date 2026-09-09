import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Trash2, TrendingDown, Fuel, Users, Truck, Package, Wrench, CircleEllipsis, Receipt as ReceiptIcon } from 'lucide-react'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../utils/format'

const EXPENSE_CATEGORIES = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'salary', label: 'Salary' },
  { value: 'transport', label: 'Transport' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' },
]

const CATEGORY_ICONS = {
  fuel: Fuel,
  salary: Users,
  transport: Truck,
  supplies: Package,
  equipment: Wrench,
  other: CircleEllipsis,
}

const dateInputValue = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', from: '', to: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const fetchExpenses = useCallback(() => {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    api.get(`/expenses?${params}`)
      .then(({ data }) => setExpenses(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(fetchExpenses, [fetchExpenses])

  const remove = async (e) => {
    if (!window.confirm('Delete this expense record?')) return
    try {
      await api.delete(`/expenses/${e._id}`)
      toast.success('Expense deleted')
      fetchExpenses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete expense')
    }
  }

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0)
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Cooperative running costs by category"
        action={
          <Button onClick={() => { setEditTarget(null); setModalOpen(true) }}>
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingDown} label="Total expenses" value={formatCurrency(total)} accent="danger" sub={`${expenses.length} records`} />
        {['fuel', 'salary', 'transport'].map((cat) => (
          <StatCard
            key={cat}
            icon={CATEGORY_ICONS[cat] || ReceiptIcon}
            label={EXPENSE_CATEGORIES.find((c) => c.value === cat)?.label}
            value={formatCurrency(byCategory[cat] || 0)}
            accent="info"
          />
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Select
          label="Category"
          options={[{ value: '', label: 'All categories' }, ...EXPENSE_CATEGORIES]}
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        />
        <Input label="From" type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
        <Input label="To" type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse-soft rounded-xl bg-subtle" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState title="No expenses recorded" description="Add the first expense to start tracking running costs." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light">
              <thead>
                <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Recorded by</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {expenses.map((e, i) => {
                  const Icon = CATEGORY_ICONS[e.category] || ReceiptIcon
                  return (
                    <motion.tr
                      key={e._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-primary-50/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-muted">{formatDate(e.date)}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold capitalize text-dark">
                          <Icon className="h-4 w-4 text-muted" />
                          {e.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-dark">{e.description || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-muted">{e.createdBy?.name || '—'}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-dark">{formatCurrency(e.amount)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => remove(e)}
                          className="text-muted transition-colors hover:text-danger"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExpenseModal
        open={modalOpen}
        expense={editTarget}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); fetchExpenses() }}
      />
    </div>
  )
}

function ExpenseModal({ open, expense, onClose, onSaved }) {
  const [form, setForm] = useState({ category: 'fuel', amount: '', description: '', date: dateInputValue(new Date()), receipt: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      expense
        ? {
            category: expense.category || 'fuel',
            amount: expense.amount ?? '',
            description: expense.description || '',
            date: dateInputValue(expense.date) || dateInputValue(new Date()),
            receipt: expense.receipt || '',
          }
        : { category: 'fuel', amount: '', description: '', date: dateInputValue(new Date()), receipt: '' },
    )
  }, [open, expense])

  const submit = async () => {
    if (!form.amount) {
      toast.error('Enter an amount')
      return
    }
    setSaving(true)
    const payload = {
      category: form.category,
      amount: Number(form.amount),
      description: form.description || undefined,
      date: form.date || new Date(),
      receipt: form.receipt || undefined,
    }
    try {
      if (expense) {
        await api.put(`/expenses/${expense._id}`, payload)
        toast.success('Expense updated')
      } else {
        await api.post('/expenses', payload)
        toast.success('Expense recorded')
      }
      onClose()
      if (onSaved) onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={expense ? 'Edit Expense' : 'Add Expense'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>{expense ? 'Save Changes' : 'Record Expense'}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Category *"
          options={EXPENSE_CATEGORIES}
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
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
          label="Date *"
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
        <Input
          label="Receipt / reference"
          value={form.receipt}
          onChange={(e) => setForm((f) => ({ ...f, receipt: e.target.value }))}
        />
        <div className="sm:col-span-2">
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
      </div>
    </Modal>
  )
}