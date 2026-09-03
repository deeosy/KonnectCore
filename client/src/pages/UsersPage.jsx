import { useEffect, useState } from 'react'
import { Plus, UserCog } from 'lucide-react'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { ROLES } from '../utils/constants'
import { initials } from '../utils/format'

const roleBadge = { admin: 'navy', manager: 'brand', fieldOfficer: 'outline' }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/users')
      .then(({ data }) => setUsers(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <PageHeader
        title="Staff Users"
        subtitle="Manage admin, manager and field officer accounts"
        action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New User</Button>}
      />
      <div className="rounded-xl border border-navy-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-navy-100" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="p-10 text-center text-sm text-navy-400">No users yet</p>
        ) : (
          <div className="divide-y divide-navy-100">
            {users.map((u) => (
              <div key={u._id} className="flex items-center gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
                  {initials(u.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy-900">{u.name}</p>
                  <p className="text-sm text-navy-500">{u.email} · {u.phone || '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {u.assignedArea && (
                    <span className="hidden text-sm text-navy-400 sm:block">{u.assignedArea}</span>
                  )}
                  <Badge status="active" label={u.isActive ? 'Active' : 'Inactive'} />
                  <span className="rounded-full border border-navy-200 bg-navy-50 px-2.5 py-0.5 text-xs capitalize text-navy-700">
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); load() }} />
    </div>
  )
}

function CreateUserModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'fieldOfficer', assignedArea: '' })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!form.name || !form.email) return
    setSaving(true)
    try {
      await api.post('/users', form)
      onSaved()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Staff User"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={saving} onClick={submit}>Create User</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <Select label="Role" options={ROLES} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
        <Input label="Assigned Area" value={form.assignedArea} onChange={(e) => setForm((f) => ({ ...f, assignedArea: e.target.value }))} />
      </div>
      <p className="mt-3 text-xs text-navy-400">Default password: password123</p>
    </Modal>
  )
}