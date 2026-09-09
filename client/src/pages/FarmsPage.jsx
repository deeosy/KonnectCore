import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sprout,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Ruler,
  Calendar,
  Package,
  ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Drawer from '../components/ui/Drawer'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SearchBar from '../components/ui/SearchBar'
import StatCard from '../components/ui/StatCard'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import { formatDate } from '../utils/format'

const CROP_STATUSES = [
  { value: 'planted', label: 'Planted' },
  { value: 'growing', label: 'Growing' },
  { value: 'harvested', label: 'Harvested' },
  { value: 'failed', label: 'Failed' },
]

const CROP_STATUS_STYLES = {
  planted: 'bg-primary-50 text-primary-700 border-primary-200',
  growing: 'bg-info-50 text-secondary-700 border-info-100',
  harvested: 'bg-success-50 text-success-700 border-success-200',
  failed: 'bg-danger-50 text-danger-700 border-danger-200',
}

function formatDateToInput(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function FarmsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('farms')
  const [farms, setFarms] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', crop: '', status: '', location: '' })
  const [selected, setSelected] = useState(null)
  const [crops, setCrops] = useState([])
  const debouncedSearch = useDebounce(filters.search)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v))
      params.set('search', debouncedSearch)
      const { data } = await api.get(`/farms?${params.toString()}`)
      setFarms(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters])

  const loadCrops = useCallback(async () => {
    try {
      const { data } = await api.get('/crops')
      setCrops(data.data)
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (tab === 'crops') loadCrops()
  }, [tab, loadCrops])

  const handleFilter = (key, value) => {
    setPage(1)
    setFilters((f) => ({ ...f, [key]: value }))
  }

  const openFarm = async (farm) => {
    try {
      const { data } = await api.get(`/farms/${farm._id}`)
      setSelected(data.data)
    } catch (error) {
      toast.error('Failed to load farm')
    }
  }

  return (
    <div>
      <PageHeader
        title="Farms & Crops"
        subtitle="Track farm profiles, plots and harvests across members"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setTab('farms')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                tab === 'farms' ? 'bg-primary text-white' : 'bg-surface text-muted hover:bg-subtle'
              }`}
            >
              Farms
            </button>
            <button
              onClick={() => setTab('crops')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                tab === 'crops' ? 'bg-primary text-white' : 'bg-surface text-muted hover:bg-subtle'
              }`}
            >
              Crop Catalog
            </button>
          </div>
        }
      />

      {tab === 'farms' ? (
        <FarmsTab
          farms={farms}
          total={total}
          totalPages={totalPages}
          page={page}
          setPage={setPage}
          loading={loading}
          filters={filters}
          onFilter={handleFilter}
          onOpen={openFarm}
        />
      ) : (
        <CropsTab crops={crops} onChanged={loadCrops} />
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Farm Profile" size="lg" side="right">
        {selected && (
          <FarmDrawer farm={selected} onClose={() => setSelected(null)} onMember={(id) => navigate(`/members/${id}`)} />
        )}
      </Drawer>
    </div>
  )
}

function FarmsTab({ farms, total, totalPages, page, setPage, loading, filters, onFilter, onOpen }) {
  return (
    <div>
      <div className="mb-5 grid gap-3 rounded-3xl border border-border bg-surface p-4 shadow-card sm:grid-cols-2 lg:grid-cols-4">
        <SearchBar
          placeholder="Search member, phone, ID..."
          value={filters.search}
          onChange={(e) => onFilter('search', e.target.value)}
        />
        <Select
          placeholder="All crops"
          options={['Cocoa', 'Coffee', 'Maize', 'Cassava', 'Rice', 'Plantain', 'Yam', 'Groundnut', 'Soybean', 'Oil Palm', 'Cashew', 'Vegetables', 'Other']}
          value={filters.crop}
          onChange={(e) => onFilter('crop', e.target.value)}
        />
        <Select
          placeholder="All statuses"
          options={CROP_STATUSES}
          value={filters.status}
          onChange={(e) => onFilter('status', e.target.value)}
        />
        <Input
          placeholder="Farm location"
          value={filters.location}
          onChange={(e) => onFilter('location', e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse-soft rounded-xl bg-subtle" />
            ))}
          </div>
        ) : farms.length === 0 ? (
          <EmptyState
            icon={Sprout}
            title="No farm profiles"
            description="Farm profiles are created from a member's profile – open a member, go to Farm & Crops and add their farm details."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light">
              <thead>
                <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Farm Size</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Crops</th>
                  <th className="px-5 py-3.5">GPS</th>
                  <th className="px-5 py-3.5">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {farms.map((f) => (
                  <tr
                    key={f._id}
                    onClick={() => onOpen(f)}
                    className="cursor-pointer transition-colors hover:bg-primary-50/30"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${f.memberId?.firstName} ${f.memberId?.lastName}`} src={f.memberId?.photo} size="sm" />
                        <div>
                          <p className="font-semibold text-dark">{f.memberId?.firstName} {f.memberId?.lastName}</p>
                          <p className="text-xs text-muted">{f.memberId?.membershipNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">{f.farmSize ? `${f.farmSize} ha` : '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{f.location || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(f.crops || []).slice(0, 3).map((c) => (
                          <span key={c._id} className={`rounded-lg border px-2 py-0.5 text-xs font-medium ${CROP_STATUS_STYLES[c.status] || 'bg-subtle text-muted'}`}>
                            {c.cropName}
                          </span>
                        ))}
                        {f.crops?.length > 3 && <span className="text-xs text-muted">+{f.crops.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">
                      {f.gpsLat && f.gpsLng ? `${f.gpsLat.toFixed(4)}, ${f.gpsLng.toFixed(4)}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">{formatDate(f.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border-light px-5 py-3.5">
            <p className="text-sm text-muted">Page {page} of {totalPages} · {total} farms</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FarmDrawer({ farm, onClose, onMember }) {
  const [expandedCrop, setExpandedCrop] = useState(null)
  const member = farm.memberId || {}
  const crops = farm.crops || []
  const harvested = crops.filter((c) => c.status === 'harvested')
  const totalArea = crops.reduce((sum, c) => sum + (c.areaHectares || 0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl bg-subtle p-4">
        <Avatar name={`${member.firstName} ${member.lastName}`} src={member.photo} size="lg" />
        <div className="min-w-0">
          <button onClick={() => onMember(member._id)} className="text-left font-bold text-dark hover:text-primary">
            {member.firstName} {member.lastName}
          </button>
          <p className="text-sm text-muted">{member.membershipNumber} · {member.phone || 'no phone'}</p>
          {member.groupId?.name && <p className="text-xs text-muted">{member.groupId.name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-subtle/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Farm size</p>
          <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-dark"><Ruler className="h-4 w-4 text-primary" />{farm.farmSize ? `${farm.farmSize} ha` : '—'}</p>
        </div>
        <div className="rounded-2xl border border-border bg-subtle/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Planted area</p>
          <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-dark"><Sprout className="h-4 w-4 text-primary" />{totalArea ? `${totalArea} ha` : '—'}</p>
        </div>
        <div className="rounded-2xl border border-border bg-subtle/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Location</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-dark"><MapPin className="h-4 w-4 text-primary" />{farm.location || '—'}</p>
        </div>
        <div className="rounded-2xl border border-border bg-subtle/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Season</p>
          <p className="mt-1 text-sm font-semibold text-dark">{farm.currentSeason || '—'}</p>
        </div>
      </div>

      {farm.gpsLat && farm.gpsLng && (
        <p className="text-xs font-medium text-muted">GPS: {farm.gpsLat.toFixed(6)}, {farm.gpsLng.toFixed(6)}</p>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-bold text-dark">Crops ({crops.length})</h4>
          {harvested.length > 0 && <span className="text-xs font-semibold text-success">{harvested.length} harvested</span>}
        </div>
        {crops.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">No crops recorded for this farm yet.</p>
        ) : (
          <div className="space-y-2">
            {crops.map((c) => (
              <div key={c._id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg border px-2 py-0.5 text-xs font-semibold capitalize ${CROP_STATUS_STYLES[c.status] || 'bg-subtle text-muted'}`}>
                      {c.status}
                    </span>
                    <span className="font-semibold text-dark">{c.cropName}</span>
                  </div>
                  <button
                    onClick={() => setExpandedCrop(expandedCrop === c._id ? null : c._id)}
                    className="rounded-lg p-1 text-muted hover:bg-subtle"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedCrop === c._id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <p className="text-muted">Area: <span className="font-semibold text-dark">{c.areaHectares ? `${c.areaHectares} ha` : '—'}</span></p>
                  <p className="text-muted">Variety: <span className="font-semibold text-dark">{c.variety || '—'}</span></p>
                  <p className="text-muted">Est.: <span className="font-semibold text-dark">{c.estimatedYield ?? '—'}</span></p>
                  <p className="text-muted">Actual: <span className="font-semibold text-dark">{c.actualYield ?? '—'}</span></p>
                </div>
                {expandedCrop === c._id && (
                  <div className="mt-3 space-y-1 border-t border-border-light pt-3 text-sm text-muted">
                    {c.plantingDate && <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Planted: {formatDate(c.plantingDate)}</p>}
                    {c.expectedHarvestDate && <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Expected harvest: {formatDate(c.expectedHarvestDate)}</p>}
                    {c.season && <p>Season: {c.season}</p>}
                    {c.notes && <p className="text-xs">Notes: {c.notes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {farm.notes && <p className="rounded-2xl bg-subtle p-4 text-sm text-muted">{farm.notes}</p>}

      <Button variant="outline" className="w-full" onClick={() => onMember(member._id)}>
        Open member profile
      </Button>
    </div>
  )
}

function CropsTab({ crops, onChanged }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  return (
    <div>
      <Card
        title="Crop Catalog"
        subtitle="Reference list used in farm profiles and collections"
        action={<Button size="sm" onClick={() => { setModalOpen(true); setEditing(null) }}><Plus className="h-4 w-4" /> Add Crop</Button>}
      >
        {crops.length === 0 ? (
          <EmptyState icon={Package} title="No crops" description="Add the crops your cooperative trades in." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light">
              <thead>
                <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5">Crop</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Default Unit</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {crops.map((c) => (
                  <tr key={c._id} className="hover:bg-subtle/30">
                    <td className="px-5 py-3.5 font-semibold text-dark">{c.name}</td>
                    <td className="px-5 py-3.5 text-sm capitalize text-muted">{c.category || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{c.unit || 'kg'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c.isActive ? 'bg-success-50 text-success-700 border-success-200' : 'bg-subtle text-muted border-border'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(c); setModalOpen(true) }} className="rounded-lg p-2 text-muted transition-colors hover:bg-primary-50 hover:text-primary" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-2 text-muted transition-colors hover:bg-danger-50 hover:text-danger" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CropFormModal open={modalOpen} crop={editing} onClose={() => setModalOpen(false)} onSaved={onChanged} />
      <DeleteCropModal crop={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={onChanged} />
    </div>
  )
}

function CropFormModal({ open, crop, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', category: 'other', unit: 'kg', isActive: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(crop
        ? { name: crop.name, category: crop.category || 'other', unit: crop.unit || 'kg', isActive: crop.isActive }
        : { name: '', category: 'other', unit: 'kg', isActive: true })
    }
  }, [open, crop])

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Crop name is required')
      return
    }
    setSaving(true)
    try {
      if (crop) {
        await api.put(`/crops/${crop._id}`, form)
        toast.success('Crop updated')
      } else {
        await api.post('/crops', form)
        toast.success('Crop added')
      }
      onClose()
      if (onSaved) onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save crop')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={crop ? `Edit ${crop.name}` : 'Add Crop'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>{crop ? 'Save Changes' : 'Add Crop'}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Crop name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input
          label="Category"
          placeholder="e.g. cash crop, cereal"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        />
        <Select
          label="Default unit"
          options={['kg', 'bag', 'bunch', 'bundles', 'other'].map((v) => ({ value: v, label: v }))}
          value={form.unit}
          onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
        />
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 pb-3 text-sm font-medium text-dark">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 accent-primary"
            />
            Active
          </label>
        </div>
      </div>
    </Modal>
  )
}

function DeleteCropModal({ crop, onClose, onDeleted }) {
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    try {
      await api.delete(`/crops/${crop._id}`)
      toast.success('Crop removed')
      onClose()
      if (onDeleted) onDeleted()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete crop')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!crop}
      onClose={onClose}
      title="Delete Crop"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={saving} onClick={submit}><Trash2 className="h-4 w-4" /> Delete</Button>
        </>
      }
    >
      <p className="text-sm text-muted">
        Remove <span className="font-semibold text-dark">{crop?.name}</span> from the catalog? Existing farm and collection records keep their crop name.
      </p>
    </Modal>
  )
}