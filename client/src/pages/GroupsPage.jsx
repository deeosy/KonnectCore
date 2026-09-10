import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Users,
  Building2,
  Map,
  MapPin,
  Home,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  Search,
  Layers,
  Landmark,
} from 'lucide-react'
import toast from 'react-hot-toast'
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
import StatCard from '../components/ui/StatCard'
import SearchBar from '../components/ui/SearchBar'

const GROUP_TYPES = [
  { value: 'organisation', label: 'Organisation' },
  { value: 'region', label: 'Region' },
  { value: 'district', label: 'District' },
  { value: 'group', label: 'Group' },
  { value: 'community', label: 'Community' },
]

// Which group type may legally nest under which. Used to build the parent
// dropdown in the create/edit form and mirrors the server-side validation.
const ALLOWED_PARENTS = {
  organisation: [],
  region: ['organisation'],
  district: ['organisation', 'region'],
  group: ['region', 'district', 'group'],
  community: ['region', 'district', 'group', 'community'],
}

const TYPE_META = {
  organisation: { icon: Building2, chip: 'bg-secondary-50 text-secondary-700', dot: 'bg-secondary' },
  region: { icon: Map, chip: 'bg-primary-50 text-primary-700', dot: 'bg-primary' },
  district: { icon: Landmark, chip: 'bg-info-50 text-secondary-700', dot: 'bg-secondary' },
  group: { icon: Users, chip: 'bg-success-50 text-success-700', dot: 'bg-success' },
  community: { icon: Home, chip: 'bg-warning-50 text-warning-700', dot: 'bg-warning-500' },
}

export default function GroupsPage() {
  const [tree, setTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({}) // id => boolean
  const [selected, setSelected] = useState(null) // selected group id
  const [detail, setDetail] = useState(null) // full group detail
  const [detailLoading, setDetailLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createDefaults, setCreateDefaults] = useState(null)
  const [editing, setEditing] = useState(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [leaders, setLeaders] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/groups/tree')
      setTree(data.data)
      const initial = {}
      data.data.forEach((root) => { initial[root._id] = true })
      setExpanded(initial)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    api.get('/users').then(({ data }) => setLeaders(data.data)).catch(() => {})
  }, [load])

  useEffect(() => {
    if (!selected) {
      setDetail(null)
      return
    }
    const fetch = async () => {
      setDetailLoading(true)
      try {
        const { data } = await api.get(`/groups/${selected}`)
        setDetail(data.data)
      } catch (error) {
        console.error(error)
        setDetail(null)
      } finally {
        setDetailLoading(false)
      }
    }
    fetch()
  }, [selected])

  const countAssigned = (nodes) =>
    nodes.reduce((sum, n) => sum + (n.memberCount || 0) + countAssigned(n.children || []), 0)
  const countType = (nodes, type) =>
    nodes.reduce(
      (sum, n) => sum + (n.type === type ? 1 : 0) + countType(n.children || [], type),
      0,
    )

  const totalMembersInGroups = countAssigned(tree)
  const regions = countType(tree, 'region')
  const districts = countType(tree, 'district')
  const subGroups = countType(tree, 'group') + countType(tree, 'community')

  const openCreate = (defaults = null) => {
    setCreateDefaults(defaults)
    setCreateOpen(true)
  }

  const refresh = async () => {
    await load()
    setExpanded((prev) => (selected ? { ...prev, [selected]: true } : prev))
  }

  const handleGroupSaved = (created) => {
    setCreateOpen(false)
    setEditing(null)
    toast.success('Group saved')
    setSelected(created._id)
    refresh()
  }

  const handleDeleted = () => {
    setDeleteOpen(false)
    setSelected(null)
    toast.success('Group removed')
    refresh()
  }

  return (
    <div>
      <PageHeader
        title="Groups & Organisation"
        subtitle="Manage your cooperative hierarchy from organisation down to community"
        action={
          <Button onClick={() => openCreate(null)}>
            <Plus className="h-4 w-4" /> New Group
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Layers} label="Nodes in structure" value={tree.length} accent="primary" sub={`${regions} regions · ${districts} districts`} />
        <StatCard icon={Users} label="Members in groups" value={totalMembersInGroups} accent="success" sub="Assigned across structure" />
        <StatCard icon={MapPin} label="Sub-groups" value={subGroups} accent="info" sub="Groups & communities" />
        <StatCard icon={Building2} label="Organisations" value={countType(tree, 'organisation') || 0} accent="dark" sub="Top level" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left: hierarchy tree */}
        <Card
          title="Organisation Structure"
          subtitle="Click a node to manage it"
          className="lg:self-start"
        >
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-11 animate-pulse-soft rounded-xl bg-subtle" />
              ))}
            </div>
          ) : tree.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No structure yet"
              description="Create your organisation and add regions, districts and groups."
              action={<Button size="sm" onClick={() => openCreate({ type: 'organisation' })}><Plus className="h-4 w-4" /> Create Organisation</Button>}
            />
          ) : (
            <div className="space-y-1">
              {tree.map((node) => (
                <TreeNode
                  key={node._id}
                  node={node}
                  level={0}
                  expanded={expanded}
                  toggle={(id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))}
                  isSelected={selected}
                  onSelect={setSelected}
                  onAddChild={(node) => {
                    setSelected(node._id)
                    openCreate({
                      parentId: node._id,
                      type: childType(node.type),
                    })
                  }}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Right: detail or empty prompt */}
        <div>
          {!selected ? (
            <Card>
              <EmptyState
                icon={Users}
                title="Select a node"
                description="Pick an organisation, region, district or group from the structure to view and manage it."
              />
            </Card>
          ) : detailLoading ? (
            <Card>
              <div className="space-y-3">
                <div className="h-6 w-48 animate-pulse-soft rounded-lg bg-subtle" />
                <div className="h-4 w-72 animate-pulse-soft rounded-lg bg-subtle" />
                <div className="h-40 animate-pulse-soft rounded-2xl bg-subtle" />
              </div>
            </Card>
          ) : detail ? (
            <GroupDetail
              group={detail}
              onEdit={() => setEditing(detail)}
              onAssign={() => setAssignOpen(true)}
              onRemove={() => setRemoveOpen(true)}
              onDelete={() => setDeleteOpen(true)}
              onMemberRemoved={refresh}
              onAddMember={() => setAssignOpen(true)}
              onOpenChild={(id) => setSelected(id)}
            />
          ) : (
            <Card>
              <EmptyState icon={Users} title="Not found" description="This node could not be loaded." />
            </Card>
          )}
        </div>
      </div>

      <GroupFormModal
        key={createOpen && createDefaults && createDefaults._formKey ? createDefaults._formKey : 'create'}
        open={createOpen}
        defaults={createDefaults}
        groups={flattenTree(tree)}
        leaders={leaders}
        onClose={() => { setCreateOpen(false); setCreateDefaults(null) }}
        onSaved={handleGroupSaved}
      />
      <EditGroupModal
        group={editing}
        groups={flattenTree(tree)}
        leaders={leaders}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          refresh()
          toast.success('Group updated')
        }}
      />
      <AssignMembersModal
        open={assignOpen}
        group={detail}
        onClose={() => setAssignOpen(false)}
        onAssigned={() => {
          setAssignOpen(false)
          refresh()
          toast.success('Members assigned')
        }}
      />
      <RemoveMembersModal
        open={removeOpen}
        group={detail}
        onClose={() => setRemoveOpen(false)}
        onRemoved={() => {
          setRemoveOpen(false)
          refresh()
          toast.success('Members removed')
        }}
      />
      <DeleteGroupModal
        open={deleteOpen}
        group={detail}
        onClose={() => setDeleteOpen(false)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}

// Recursive tree node row.
function TreeNode({ node, level, expanded, toggle, isSelected, onSelect, onAddChild }) {
  const meta = TYPE_META[node.type] || TYPE_META.group
  const Icon = meta.icon
  const hasChildren = (node.children || []).length > 0
  const isOpen = !!expanded[node._id]

  return (
    <div>
      <div
        className={`group flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors ${
          isSelected === node._id ? 'bg-primary-50 text-primary-700' : 'hover:bg-subtle'
        }`}
        style={{ paddingLeft: `${12 + level * 22}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => toggle(node._id)}
            className="shrink-0 rounded-md p-0.5 text-muted hover:bg-border hover:text-dark"
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-[22px] shrink-0" />
        )}
        <button onClick={() => onSelect(node._id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-subtle">
            <Icon className={`h-4 w-4 ${meta.chip.split(' ')[0] === 'bg-secondary-50' ? 'text-secondary' : meta.chip.includes('success') ? 'text-success' : 'text-primary'}`} />
          </span>
          <span className="truncate font-semibold text-dark">{node.name}</span>
          <span className="shrink-0 rounded-full bg-subtle px-2 py-0.5 text-xs font-medium text-muted">
            {node.memberCount || 0}
          </span>
        </button>
        <button
          onClick={() => onAddChild(node)}
          title={`Add child to ${node.name}`}
          className="shrink-0 rounded-md p-1 text-muted opacity-0 transition-opacity hover:bg-border hover:text-primary group-hover:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {hasChildren && isOpen && (
        <div className="ml-[11px] border-l border-border-light">
          {node.children.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              level={level + 1}
              expanded={expanded}
              toggle={toggle}
              isSelected={isSelected}
              onSelect={onSelect}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// -- Helpers for the form modals -------------------------------------------

function flattenTree(nodes) {
  return nodes.flatMap((n) => [n, ...flattenTree(n.children || [])])
}

function childType(type) {
  return { organisation: 'region', region: 'district', district: 'group', group: 'community', community: 'community' }[type] || 'group'
}

function parentOptions(groups, type, ignoreId) {
  const allowed = ALLOWED_PARENTS[type] || []
  return groups
    .filter((g) => allowed.includes(g.type) && String(g._id) !== String(ignoreId || ''))
    .map((g) => ({ value: g._id, label: g.name }))
}

// -- Create / Edit group modal (shared form) --------------------------------

function GroupForm({ defaults, groups, leaders, onSaved, onClose, editing }) {
  const [form, setForm] = useState(() => ({
    name: editing?.name || defaults?.name || '',
    type: editing?.type || defaults?.type || 'group',
    parentId: editing?.parentId || defaults?.parentId || '',
    leaderId: editing?.leaderId || defaults?.leaderId || '',
    location: editing?.location || defaults?.location || '',
    description: editing?.description || defaults?.description || '',
  }))
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState('')

  const set = (key) => (e) => setForm((f) => {
    const next = { ...f, [key]: e.target.value }
    if (key === 'name') setNameError('')
    if (key === 'type') next.parentId = ''
    return next
  })

  const submit = async () => {
    if (!form.name.trim()) {
      setNameError('Name is required')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, parentId: form.parentId || undefined }
      if (editing) {
        const { data } = await api.put(`/groups/${editing._id}`, payload)
        onSaved(data.data)
      } else {
        const { data } = await api.post('/groups', payload)
        onSaved(data.data)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save group')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Name *" value={form.name} onChange={set('name')} error={nameError} placeholder="e.g. Ashanti Region" />
      <Select label="Type" options={GROUP_TYPES} value={form.type} onChange={set('type')} />
      <Select
        label="Parent"
        placeholder="None (top level)"
        options={parentOptions(groups, form.type, editing?._id)}
        value={form.parentId}
        onChange={set('parentId')}
        className="sm:col-span-2"
      />
      <Select
        label="Leader"
        placeholder="Select leader"
        options={leaders.map((o) => ({ value: o._id, label: o.name }))}
        value={form.leaderId}
        onChange={set('leaderId')}
        className="sm:col-span-2"
      />
      <Input label="Location" value={form.location} onChange={set('location')} placeholder="e.g. Kumasi" />
      <div className="sm:col-span-2">
        <Input label="Description" value={form.description} onChange={set('description')} placeholder="Optional note" />
      </div>
      <div className="flex justify-end gap-3 sm:col-span-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button loading={saving} onClick={submit}>{editing ? 'Save Changes' : 'Create Group'}</Button>
      </div>
    </div>
  )
}

function GroupFormModal({ open, defaults, groups, leaders, onClose, onSaved }) {
  return (
    <Modal open={open} onClose={onClose} title="New Group">
      <GroupForm defaults={defaults} groups={groups} leaders={leaders} onClose={onClose} onSaved={onSaved} />
    </Modal>
  )
}

function EditGroupModal({ group, groups, leaders, onClose, onSaved }) {
  return (
    <Modal open={!!group} onClose={onClose} title={`Edit ${group?.name || ''}`}>
      {group && <GroupForm editing={group} groups={groups} leaders={leaders} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  )
}

// -- Assign members modal -----------------------------------------------

function AssignMembersModal({ open, group, onClose, onAssigned }) {
  const [unassigned, setUnassigned] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searched, setSearched] = useState('')

  useEffect(() => {
    if (!open) {
      setUnassigned([])
      setSelected({})
      setSearch('')
      return
    }
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (searched) params.set('search', searched)
        const { data } = await api.get(`/groups/unassigned-members?${params.toString()}`)
        if (!cancelled) setUnassigned(data.data)
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [open, searched])

  const toggle = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }))

  const submit = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k])
    if (!ids.length) {
      toast.error('Select at least one member')
      return
    }
    setSaving(true)
    try {
      await api.post(`/groups/${group._id}/members`, { memberIds: ids })
      onAssigned()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign members')
    } finally {
      setSaving(false)
    }
  }

  const count = Object.values(selected).filter(Boolean).length

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign Members to ${group?.name || ''}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}><UserPlus className="h-4 w-4" /> Assign {count > 0 && `(${count})`}</Button>
        </>
      }
    >
      <SearchBar
        placeholder="Search unassigned members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />
      <button
        className="mb-3 text-sm font-semibold text-primary hover:underline"
        onClick={() => setSearched(search)}
      >
        Apply search
      </button>
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse-soft rounded-xl bg-subtle" />
            ))}
          </div>
        ) : unassigned.length === 0 ? (
          <EmptyState icon={Search} title="No unassigned members" description="Try adjusting your search, or all members are already in a group." />
        ) : (
          unassigned.map((m) => (
            <label
              key={m._id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-light p-3 transition-colors hover:bg-subtle"
            >
              <input
                type="checkbox"
                checked={!!selected[m._id]}
                onChange={() => toggle(m._id)}
                className="h-4 w-4 accent-primary"
              />
              <Avatar name={`${m.firstName} ${m.lastName}`} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-dark">{m.firstName} {m.lastName}</p>
                <p className="text-xs text-muted">{m.membershipNumber} · {m.phone || 'no phone'}</p>
              </div>
              {m.location && <span className="hidden shrink-0 text-xs text-muted sm:block">{m.location}</span>}
            </label>
          ))
        )}
      </div>
    </Modal>
  )
}

// -- Remove members modal ------------------------------------------------

function RemoveMembersModal({ open, group, onClose, onRemoved }) {
  const [selected, setSelected] = useState({})
  const [saving, setSaving] = useState(false)
  const members = group?.members || []

  useEffect(() => {
    if (!open) setSelected({})
  }, [open])

  const toggle = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }))

  const submit = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k])
    if (!ids.length) {
      toast.error('Select at least one member')
      return
    }
    setSaving(true)
    try {
      await api.delete(`/groups/${group._id}/members`, { data: { memberIds: ids } })
      onRemoved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove members')
    } finally {
      setSaving(false)
    }
  }

  const count = Object.values(selected).filter(Boolean).length

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Remove Members from ${group?.name || ''}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline-danger" loading={saving} onClick={submit}>
            <UserMinus className="h-4 w-4" /> Remove {count > 0 && `(${count})`}
          </Button>
        </>
      }
    >
      {members.length === 0 ? (
        <EmptyState icon={UserMinus} title="No members" description="This group has no members to remove." />
      ) : (
        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {members.map((m) => (
            <label
              key={m._id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-light p-3 transition-colors hover:bg-subtle"
            >
              <input
                type="checkbox"
                checked={!!selected[m._id]}
                onChange={() => toggle(m._id)}
                className="h-4 w-4 accent-danger"
              />
              <Avatar name={`${m.firstName} ${m.lastName}`} src={m.photo} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-dark">{m.firstName} {m.lastName}</p>
                <p className="text-xs text-muted">{m.membershipNumber}</p>
              </div>
            </label>
          ))}
        </div>
      )}
    </Modal>
  )
}

// -- Delete confirm modal -------------------------------------------------

function DeleteGroupModal({ open, group, onClose, onDeleted }) {
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    try {
      await api.delete(`/groups/${group._id}`)
      onDeleted()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete group')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Group"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={saving} onClick={submit}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">
        Are you sure you want to delete <span className="font-semibold text-dark">{group?.name}</span>?
        Members assigned to it will be unassigned, and any child nodes will remain under their current structure.
      </p>
    </Modal>
  )
}

// -- Group detail panel ---------------------------------------------------

function GroupDetail({ group, onEdit, onAssign, onRemove, onDelete, onMemberRemoved, onOpenChild }) {
  const meta = TYPE_META[group.type] || TYPE_META.group
  const Icon = meta.icon
  const members = group.members || []
  const children = group.children || []
  const [removing, setRemoving] = useState(null)

  const removeOne = async (id) => {
    setRemoving(id)
    try {
      await api.delete(`/groups/${group._id}/members`, { data: { memberIds: [id] } })
      toast.success('Member removed')
      onMemberRemoved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <motion.div
      key={group._id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${meta.chip}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-dark">{group.name}</h2>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${meta.chip}`}>
                {group.type}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted">
              {members.length} member{members.length === 1 ? '' : 's'}
              {group.leaderId ? ` · Lead: ${group.leaderId.name}` : ''}
              {group.location ? ` · ${group.location}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="h-4 w-4" /> Edit</Button>
          <Button variant="outline-primary" size="sm" onClick={onAssign}><UserPlus className="h-4 w-4" /> Assign</Button>
          <Button variant="outline-danger" size="sm" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      {group.description && (
        <p className="rounded-2xl border border-border-light bg-subtle/50 p-4 text-sm text-muted">{group.description}</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Members" subtitle={`${members.length} total`} className="md:self-start">
          {members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No members yet"
              description="Assign members to this node."
              action={<Button size="sm" variant="outline-primary" onClick={onAssign}><UserPlus className="h-4 w-4" /> Assign members</Button>}
            />
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m._id} className="flex items-center gap-3 rounded-xl border border-border-light p-2.5">
                  <Avatar name={`${m.firstName} ${m.lastName}`} src={m.photo} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-dark">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-muted">{m.membershipNumber} · {m.phone || 'no phone'}</p>
                  </div>
                  <button
                    disabled={removing === m._id}
                    onClick={() => removeOne(m._id)}
                    className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-50 hover:text-danger"
                    title="Remove from group"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="pt-1">
                <Button variant="outline-danger" size="sm" onClick={onRemove}><UserMinus className="h-4 w-4" /> Remove selected</Button>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Child nodes" subtitle="Nested under this node">
            {children.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">Nothing nested here yet.</p>
            ) : (
              <div className="space-y-2">
                {children.map((c) => {
                  const cMeta = TYPE_META[c.type] || TYPE_META.group
                  const CIcon = cMeta.icon
                  return (
                    <button
                      key={c._id}
                      onClick={() => onOpenChild(c._id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-border-light p-3 text-left transition-colors hover:bg-subtle"
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cMeta.chip}`}>
                        <CIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-dark">{c.name}</span>
                        <span className="text-xs text-muted">{c.type}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-light" />
                    </button>
                  )
                })}
              </div>
            )}
          </Card>

          <Card title="Details">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Name</dt><dd className="font-semibold text-dark">{group.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Type</dt><dd className="font-semibold text-dark capitalize">{group.type}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Leader</dt><dd className="font-semibold text-dark">{group.leaderId?.name || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Location</dt><dd className="font-semibold text-dark">{group.location || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Created</dt><dd className="font-semibold text-dark">{new Date(group.createdAt).toLocaleDateString()}</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}