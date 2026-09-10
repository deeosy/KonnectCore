import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import { ROLES } from '../utils/constants'

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
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse-soft rounded-xl bg-subtle" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="No users yet" description="Staff accounts will appear here." />
        ) : (
          <div className="divide-y divide-border-light">
            {users.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-5 transition-colors hover:bg-subtle/30"
              >
                <Avatar name={u.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-dark">{u.name}</p>
                  <p className="text-sm text-muted">{u.email} · {u.phone || '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {u.assignedArea && (
                    <span className="hidden text-sm text-muted sm:block">{u.assignedArea}</span>
                  )}
                  <Badge status="active" label={u.isActive ? 'Active' : 'Inactive'} />
                  <span className="rounded-full border border-border bg-subtle px-2.5 py-0.5 text-xs font-medium capitalize text-dark">
                    {u.role}
                  </span>
                </div>
              </motion.div>
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
      toast.error(err.response?.data?.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Staff User"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>Create User</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <Select label="Role" options={ROLES} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
        <Input label="Assigned Area" value={form.assignedArea} onChange={(e) => setForm((f) => ({ ...f, assignedArea: e.target.value }))} />
      </div>
      <p className="mt-3 text-xs text-muted">Default password: password123</p>
    </Modal>
  )
}
