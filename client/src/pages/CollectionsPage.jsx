import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Scale, Coins, Package, Boxes, Pencil, Trash2, Plus, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import StatCard from '../components/ui/StatCard'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import CollectionModal from '../components/collections/CollectionModal'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'
import { CROPS } from '../utils/constants'

const BATCH_STATUSES = ['open', 'closed', 'shipped', 'delivered']

function CollectionsPage({ autoOpen }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [view, setView] = useState(searchParams.get('view') === 'batches' ? 'batches' : 'collections')

  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', crop: '', from: '', to: '' })

  const [modalOpen, setModalOpen] = useState(autoOpen)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [batches, setBatches] = useState([])
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [batchDetail, setBatchDetail] = useState(null)
  const [batchEdit, setBatchEdit] = useState(null)
  const [batchDelete, setBatchDelete] = useState(null)

  const loadCollections = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (filters.search) params.set('search', filters.search)
      if (filters.crop) params.set('crop', filters.crop)
      if (filters.from) params.set('from', filters.from)
      if (filters.to) params.set('to', filters.to)
      const { data } = await api.get(`/collections?${params}`)
      setCollections(data.data)
    } catch {
      toast.error('Failed to load collections')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadBatches = useCallback(async () => {
    try {
      const { data } = await api.get('/collections/batches')
      setBatches(data.data)
    } catch {
      toast.error('Failed to load batches')
    }
  }, [])

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  useEffect(() => {
    if (view === 'batches') loadBatches()
  }, [view, loadBatches])

  const totals = collections.reduce(
    (acc, c) => {
      acc.count += 1
      acc.weight += Number(c.quantity) || 0
      acc.value += Number(c.totalValue) || 0
      return acc
    },
    { count: 0, weight: 0, value: 0 },
  )

  const deleteCollection = async () => {
    try {
      await api.delete(`/collections/${deleteTarget._id}`)
      toast.success('Collection removed')
      setDeleteTarget(null)
      loadCollections()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove collection')
    }
  }

  const viewBatches = () => {
    setView('batches')
    navigate('/collections?view=batches')
  }

  const viewCollections = () => {
    setView('collections')
    navigate('/collections')
  }

  return (
    <div>
      <PageHeader
        title="Collections"
        subtitle="Produce collections, harvest records and shipping batches"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Record Collection
          </Button>
        }
      />

      {/* View switcher */}
      <div className="mb-5 flex gap-1 rounded-2xl border border-border bg-surface p-1.5 shadow-card w-fit">
        <button
          onClick={viewCollections}
          className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
            view === 'collections' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-subtle hover:text-dark'
          }`}
        >
          <Package className="h-4 w-4" /> Collections
        </button>
        <button
          onClick={viewBatches}
          className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
            view === 'batches' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-subtle hover:text-dark'
          }`}
        >
          <Boxes className="h-4 w-4" /> Batches
        </button>
      </div>

      {view === 'collections' ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard icon={Package} label="Collection records" value={formatNumber(totals.count)} accent="info" />
            <StatCard icon={Scale} label="Total quantity" value={`${formatNumber(totals.weight)} kg`} accent="primary" />
            <StatCard icon={Coins} label="Total value" value={formatCurrency(totals.value)} accent="success" />
          </div>

          {/* Filters */}
          <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Search member name / phone…"
                className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-dark outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <Select
              placeholder="All crops"
              options={CROPS}
              value={filters.crop}
              onChange={(e) => setFilters((f) => ({ ...f, crop: e.target.value }))}
            />
            <Input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            />
            <Input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse-soft rounded-xl bg-subtle" />
                ))}
              </div>
            ) : collections.length === 0 ? (
              <EmptyState
                title="No collections found"
                description="Adjust your filters or record a new collection."
                action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Record Collection</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-light">
                  <thead>
                    <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Member</th>
                      <th className="px-5 py-3.5">Crop</th>
                      <th className="px-5 py-3.5">Qty</th>
                      <th className="px-5 py-3.5">Grade</th>
                      <th className="px-5 py-3.5">Total Value</th>
                      <th className="px-5 py-3.5">Captured</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {collections.map((c, i) => (
                      <motion.tr
                        key={c._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-primary-50/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm text-muted">{formatDate(c.date)}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-dark">
                          <button
                            onClick={() => c.memberId && navigate(`/members/${c.memberId._id}`)}
                            className="hover:text-primary"
                          >
                            {c.memberId ? `${c.memberId.firstName} ${c.memberId.lastName}` : '—'}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-sm">
                          {c.crop}
                          {c.batchNumber && <span className="ml-2 inline-flex items-center rounded-md bg-subtle px-1.5 py-0.5 text-[11px] font-semibold text-muted">#{c.batchNumber}</span>}
                        </td>
                        <td className="px-5 py-3.5 text-sm">{c.quantity} {c.unit}</td>
                        <td className="px-5 py-3.5"><Badge status="info" label={`Grade ${c.qualityGrade}`} /></td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-dark">{formatCurrency(c.totalValue)}</td>
                        <td className="px-5 py-3.5 text-sm text-muted">{c.capturedBy?.name || '—'}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => { setEditing(c); setModalOpen(true) }}
                              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-primary-50 hover:text-primary"
                              title="Edit collection"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-50 hover:text-danger"
                              title="Delete collection"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <BatchView
          batches={batches}
          loadBatches={loadBatches}
          onNew={() => setBatchModalOpen(true)}
          onDetail={setBatchDetail}
          onEdit={setBatchEdit}
          onDelete={setBatchDelete}
        />
      )}

      <CollectionModal
        key={modalOpen ? (editing?._id || 'new') : 'closed'}
        open={modalOpen}
        collection={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSaved={() => { setModalOpen(false); setEditing(null); loadCollections() }}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        title="Delete Collection"
        message={`Remove the ${deleteTarget?.crop || ''} collection from ${deleteTarget?.memberId ? `${deleteTarget.memberId.firstName} ${deleteTarget.memberId.lastName}` : 'this member'}?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteCollection}
      />

      <BatchCreateModal
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onSaved={() => { setBatchModalOpen(false); loadBatches(); loadCollections() }}
      />
      <BatchDetailModal batchDetail={batchDetail} onClose={() => setBatchDetail(null)} onEdit={(b) => { setBatchDetail(null); setBatchEdit(b) }} />
      <BatchEditModal
        batch={batchEdit}
        onClose={() => setBatchEdit(null)}
        onSaved={() => { setBatchEdit(null); loadBatches(); loadCollections() }}
      />
      <DeleteConfirmModal
        open={!!batchDelete}
        title="Delete Batch"
        message={`Delete batch ${batchDelete?.batchNumber || ''}? Its ${batchDelete?.totalWeight ?? ''} kg will be released back to unassigned collections.`}
        onClose={() => setBatchDelete(null)}
        onConfirm={() => deleteBatch(batchDelete, loadBatches, loadCollections, setBatchDelete)}
      />
    </div>
  )
}

function BatchView({ batches, loadBatches, onNew, onDetail, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-dark">Shipping Batches</h3>
          <p className="text-xs text-muted">Group collections into dispatches for market / buyer delivery</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadBatches}>Refresh</Button>
          <Button size="sm" onClick={onNew}><Plus className="h-4 w-4" /> New Batch</Button>
        </div>
      </div>
      {batches.length === 0 ? (
        <EmptyState title="No batches yet" description="Create a batch and assign collections to it." action={<Button size="sm" onClick={onNew}><Plus className="h-4 w-4" /> New Batch</Button>} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-light">
            <thead>
              <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="px-5 py-3.5">Batch</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Total Weight</th>
                <th className="px-5 py-3.5">Collection Point</th>
                <th className="px-5 py-3.5">Buyer</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {batches.map((b) => (
                <tr key={b._id} className="hover:bg-primary-50/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-bold text-dark">{b.batchNumber}</td>
                  <td className="px-5 py-3.5"><Badge status={b.status} /></td>
                  <td className="px-5 py-3.5 text-sm">{formatNumber(b.totalWeight)} kg</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{b.collectionPoint || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{b.buyer || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{formatDate(b.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onDetail(b)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-50" title="View collections">View</button>
                      <button onClick={() => onEdit(b)} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-primary-50 hover:text-primary" title="Update batch"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => onDelete(b)} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-50 hover:text-danger" title="Delete batch"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function BatchCreateModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ batchNumber: '', collectionPoint: '', buyer: '' })
  const [unassigned, setUnassigned] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({ batchNumber: '', collectionPoint: '', buyer: '' })
    setSelected([])
    setLoading(true)
    api
      .get('/collections?batchId=none&limit=100')
      .then(({ data }) => setUnassigned(data.data))
      .catch(() => setUnassigned([]))
      .finally(() => setLoading(false))
  }, [open])

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const create = async () => {
    if (!form.batchNumber || selected.length === 0) {
      toast.error('Enter a batch number and select at least one collection')
      return
    }
    setLoading(true)
    try {
      await api.post('/collections/batch/add', {
        collectionIds: selected,
        batchNumber: form.batchNumber,
        collectionPoint: form.collectionPoint,
        buyer: form.buyer,
        status: 'open',
      })
      toast.success('Batch created')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create batch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Shipping Batch"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={loading} onClick={create}>Create Batch</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Batch number *" placeholder="e.g. BATCH-2026-001" value={form.batchNumber} onChange={(e) => setForm((f) => ({ ...f, batchNumber: e.target.value }))} />
        <Input label="Collection point" placeholder="e.g. Sunyani depot" value={form.collectionPoint} onChange={(e) => setForm((f) => ({ ...f, collectionPoint: e.target.value }))} />
        <div className="sm:col-span-2">
          <Input label="Buyer" placeholder="e.g. Cocoa Marketing Co." value={form.buyer} onChange={(e) => setForm((f) => ({ ...f, buyer: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-sm font-medium text-dark">
            Assign unassigned collections ({unassigned.length}) *
          </p>
          {loading ? (
            <p className="text-sm text-muted">Loading unassigned collections…</p>
          ) : unassigned.length === 0 ? (
            <p className="text-sm text-muted">No unassigned collections available.</p>
          ) : (
            <div className="max-h-56 overflow-y-auto rounded-xl border border-border">
              {unassigned.map((c) => (
                <label
                  key={c._id}
                  className={`flex cursor-pointer items-center gap-3 border-b border-border-light px-4 py-2.5 text-sm transition-colors last:border-0 hover:bg-subtle/50 ${selected.includes(c._id) ? 'bg-primary-50' : ''}`}
                >
                  <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggle(c._id)} className="h-4 w-4 accent-[#0F766E]" />
                  <span className="font-semibold text-dark">{c.memberId ? `${c.memberId.firstName} ${c.memberId.lastName}` : 'Unknown'}</span>
                  <span className="text-xs text-muted">{c.crop}</span>
                  <span className="ml-auto text-xs font-semibold text-muted">{c.quantity} {c.unit}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

function BatchDetailModal({ batchDetail, onClose, onEdit }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!batchDetail) return
    setData(null)
    api.get(`/collections/batches/${batchDetail._id}`)
      .then((r) => setData(r.data.data))
      .catch(() => setData(null))
  }, [batchDetail])

  return (
    <Modal
      open={!!batchDetail}
      onClose={onClose}
      title={data ? `Batch ${data.batchNumber}` : 'Batch details'}
      size="lg"
      footer={
        <Button variant="outline" onClick={() => data && onEdit(data)}>
          <Pencil className="h-4 w-4" /> Update Batch
        </Button>
      }
    >
      {!data ? (
        <p className="py-4 text-center text-sm text-muted">Loading…</p>
      ) : (
        <div>
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted">Status</p><Badge status={data.status} className="mt-1" /></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted">Weight</p><p className="mt-1 text-sm font-bold text-dark">{formatNumber(data.totalWeight)} kg</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted">Point</p><p className="mt-1 text-sm font-bold text-dark">{data.collectionPoint || '—'}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted">Buyer</p><p className="mt-1 text-sm font-bold text-dark">{data.buyer || '—'}</p></div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full divide-y divide-border-light">
              <thead>
                <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Crop</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {(data.collections || []).map((c) => (
                  <tr key={c._id}>
                    <td className="px-4 py-3 text-sm font-semibold text-dark">
                      {c.memberId ? `${c.memberId.firstName} ${c.memberId.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">{c.crop}</td>
                    <td className="px-4 py-3 text-sm">{c.quantity} {c.unit}</td>
                    <td className="px-4 py-3 text-sm">{c.qualityGrade}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-dark">{formatCurrency(c.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  )
}

function BatchEditModal({ batch, onClose, onSaved }) {
  const [form, setForm] = useState({ status: 'open', collectionPoint: '', buyer: '', certification: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!batch) return
    setForm({
      status: batch.status || 'open',
      collectionPoint: batch.collectionPoint || '',
      buyer: batch.buyer || '',
      certification: batch.certification || '',
    })
  }, [batch])

  const save = async () => {
    setLoading(true)
    try {
      await api.put(`/collections/batches/${batch._id}`, form)
      toast.success('Batch updated')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update batch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={!!batch}
      onClose={onClose}
      title={batch ? `Update ${batch.batchNumber}` : 'Update batch'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={loading} onClick={save}>Save</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Status"
          options={BATCH_STATUSES}
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        />
        <Input label="Collection point" value={form.collectionPoint} onChange={(e) => setForm((f) => ({ ...f, collectionPoint: e.target.value }))} />
        <Input label="Buyer" value={form.buyer} onChange={(e) => setForm((f) => ({ ...f, buyer: e.target.value }))} />
        <Input label="Certification" placeholder="e.g. Organic, Utz…" value={form.certification} onChange={(e) => setForm((f) => ({ ...f, certification: e.target.value }))} />
      </div>
    </Modal>
  )
}

async function deleteBatch(batch, loadBatches, loadCollections, close) {
  try {
    await api.delete(`/collections/batches/${batch._id}`)
    toast.success('Batch removed')
    close(null)
    loadBatches()
    loadCollections()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to remove batch')
  }
}

function DeleteConfirmModal({ open, title, message, onClose, onConfirm }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}><Trash2 className="h-4 w-4" /> Delete</Button>
        </>
      }
    >
      <p className="text-sm text-muted">{message}</p>
    </Modal>
  )
}

export default CollectionsPage