import { useEffect, useRef, useState } from 'react'
import { Search, User } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { TASK_STATUSES } from '../../utils/constants'

// Admin/manager only — assigns a task to a field officer (and optionally ties
// it to a member). Officers see and update these from their Field dashboard.
export default function TaskModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({
    assignedTo: '',
    memberId: '',
    title: '',
    description: '',
    dueDate: '',
    status: 'pending',
  })
  const [officers, setOfficers] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState([])
  const [pickedMember, setPickedMember] = useState(null)
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const searchTimer = useRef(null)

  useEffect(() => {
    if (!open) return
    setForm({
      assignedTo: '',
      memberId: '',
      title: '',
      description: '',
      dueDate: '',
      status: 'pending',
    })
    setMemberSearch('')
    setMemberResults([])
    setPickedMember(null)
    api
      .get('/users')
      .then(({ data }) =>
        setOfficers((data.data || []).filter((u) => u.role === 'fieldOfficer' && u.isActive !== false)),
      )
      .catch(() => setOfficers([]))
  }, [open])

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

  const submit = async () => {
    if (!form.assignedTo || !form.title.trim()) {
      toast.error('Select an officer and enter a title')
      return
    }
    setSaving(true)
    try {
      await api.post('/visits/tasks', {
        assignedTo: form.assignedTo,
        memberId: form.memberId || undefined,
        title: form.title.trim(),
        description: form.description || undefined,
        dueDate: form.dueDate || undefined,
        status: form.status,
      })
      toast.success('Task assigned')
      onClose()
      if (onSaved) onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Task"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>Assign Task</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select
            label="Assign to officer *"
            placeholder={officers.length ? 'Select officer' : 'No field officers yet'}
            options={officers.map((o) => ({
              value: o._id,
              label: o.name ? `${o.name} (${o.assignedArea || 'no area'})` : o.email,
            }))}
            value={form.assignedTo}
            onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Follow up on produce pickup"
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional detail for the officer"
          />
        </div>
        <Input
          label="Due date"
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
        />
        <Select
          label="Initial status"
          options={TASK_STATUSES}
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        />
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-dark">Related member</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
            <input
              value={memberSearch}
              onChange={(e) => searchMembers(e.target.value)}
              placeholder="Optional — search member…"
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
      </div>
    </Modal>
  )
}