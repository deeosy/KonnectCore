import { useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/groups?hierarchy=true')
      setGroups(data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <PageHeader
        title="Groups & Organisation"
        subtitle="Manage regions, districts and groups"
        action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Group</Button>}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse-soft rounded-3xl bg-subtle" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState icon={Users} title="No groups yet" description="Create your first group to get started." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <motion.button
              key={g._id}
              onClick={() => setSelected(g)}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-3xl border border-border bg-surface p-5 text-left shadow-card transition-colors hover:border-primary-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-border bg-subtle px-2.5 py-0.5 text-xs font-medium capitalize text-muted">
                  {g.type}
                </span>
              </div>
              <h3 className="mt-3 font-bold text-dark">{g.name}</h3>
              {g.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>}
              <div className="mt-3 flex items-center gap-4 text-sm text-muted">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {g.memberCount || 0}</span>
                {g.leaderId && <span className="truncate">Leader: {g.leaderId.name}</span>}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); load() }} groups={groups} />
      <GroupDetailModal group={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function CreateGroupModal({ open, onClose, onSaved, groups }) {
  const [form, setForm] = useState({ name: '', type: 'group', parentId: '', leaderId: '', location: '', description: '' })
  const [leaders, setLeaders] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    api.get('/users').then(({ data }) => setLeaders(data.data)).catch(() => {})
  }, [open])

  const submit = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      await api.post('/groups', form)
      onSaved()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create group')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Group"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>Create Group</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Select label="Type" options={['organisation', 'region', 'district', 'group', 'community'].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
        <Select label="Parent" placeholder="None (top level)" options={groups.filter((g) => g.type !== 'organisation').map((g) => ({ value: g._id, label: g.name }))} value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))} />
        <Select label="Leader" placeholder="Select leader" options={leaders.map((o) => ({ value: o._id, label: o.name }))} value={form.leaderId} onChange={(e) => setForm((f) => ({ ...f, leaderId: e.target.value }))} />
        <Input label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
        <div className="sm:col-span-2">
          <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
      </div>
    </Modal>
  )
}

function GroupDetailModal({ group, onClose }) {
  const [members, setMembers] = useState([])
  useEffect(() => {
    if (group) {
      api.get(`/groups/${group._id}`).then(({ data }) => setMembers(data.data.members || [])).catch(() => {})
    }
  }, [group])

  return (
    <Modal open={!!group} onClose={onClose} title={group?.name} size="lg">
      {group && (
        <div>
          <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted">
            <span className="rounded-lg bg-subtle px-2.5 py-1 capitalize font-medium">{group.type}</span>
            <span className="rounded-lg bg-primary-50 px-2.5 py-1 font-semibold text-primary">{members.length} members</span>
            {group.leaderId && <span className="rounded-lg bg-subtle px-2.5 py-1">Leader: {group.leaderId.name}</span>}
          </div>
          <h4 className="mb-2 text-sm font-bold text-dark">Members ({members.length})</h4>
          {members.length === 0 ? (
            <p className="text-sm text-muted">No members assigned</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {members.map((m) => (
                <div key={m._id} className="flex items-center gap-3 rounded-xl border border-border-light p-2.5">
                  <Avatar name={`${m.firstName} ${m.lastName}`} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-dark">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-muted">{m.phone} · {m.membershipNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
