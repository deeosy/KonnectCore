import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  MapPin,
  User,
  Hash,
  Sprout,
  FileText,
  Upload,
  Package,
  Wallet,
  HandCoins,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Avatar from '../components/ui/Avatar'
import { formatCurrency, formatDate } from '../utils/format'
import { CROPS, QUALITY_GRADES } from '../utils/constants'

const tabs = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'farm', label: 'Farm & Crops', icon: Sprout },
  { key: 'collections', label: 'Collections', icon: Package },
  { key: 'payments', label: 'Payments', icon: Wallet },
  { key: 'loans', label: 'Loans', icon: HandCoins },
  { key: 'documents', label: 'Documents', icon: FileText },
]

export default function MemberDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [history, setHistory] = useState(null)
  const [farm, setFarm] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [collectionOpen, setCollectionOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [memberRes, historyRes] = await Promise.all([
        api.get(`/members/${id}`),
        api.get(`/members/${id}/history`),
      ])
      setMember(memberRes.data.data)
      setHistory(historyRes.data.data)
      const farmRes = await api.get(`/farms/member/${id}`).catch(() => null)
      setFarm(farmRes?.data?.data || null)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse-soft rounded-xl bg-subtle" />
        <div className="h-48 animate-pulse-soft rounded-3xl bg-subtle" />
      </div>
    )
  }

  if (!member) {
    return <div className="text-muted">Member not found</div>
  }

  const infoItems = [
    { icon: Phone, label: 'Phone', value: member.phone || '—' },
    { icon: Hash, label: 'ID Number', value: `${member.idType || ''} ${member.idNumber || ''}`.trim() || '—' },
    { icon: MapPin, label: 'Location', value: [member.location, member.district, member.region].filter(Boolean).join(', ') || '—' },
    { icon: MapPin, label: 'GPS', value: member.gpsLat ? `${member.gpsLat}, ${member.gpsLng}` : '—' },
  ]

  return (
    <div>
      <button
        onClick={() => navigate('/members')}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </button>

      {/* Header card */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            name={`${member.firstName} ${member.lastName}`}
            src={member.photo}
            size="xl"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-dark">
              {member.firstName} {member.lastName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge status={member.status} />
              <span className="text-sm text-muted">#{member.membershipNumber}</span>
              {member.groupId && (
                <span className="rounded-lg bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
                  {member.groupId.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/members/${member._id}/edit`)}>Edit</Button>
          <Button size="sm" onClick={() => setCollectionOpen(true)}>Record Collection</Button>
        </div>
      </div>

      {/* Info grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {infoItems.map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <div className="flex items-center gap-2 text-muted">
              <item.icon className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold text-dark">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1.5 shadow-card">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
              tab === t.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:bg-subtle hover:text-dark'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab === 'overview' && (
          <OverviewTab member={member} farm={farm} history={history} />
        )}
        {tab === 'farm' && <FarmTab member={member} farm={farm} onRefresh={load} />}
        {tab === 'collections' && <CollectionsTab collections={history?.collections || []} />}
        {tab === 'payments' && <PaymentsTab payments={history?.payments || []} />}
        {tab === 'loans' && <LoansTab loans={history?.loans || []} />}
        {tab === 'documents' && <DocumentsTab member={member} onRefresh={load} />}
      </Card>

      <CollectionModal
        open={collectionOpen}
        onClose={() => setCollectionOpen(false)}
        memberId={member._id}
        onSaved={() => {
          setCollectionOpen(false)
          load()
          setTab('collections')
        }}
      />
    </div>
  )
}

function OverviewTab({ member, farm, history }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h3 className="mb-3 text-base font-bold text-dark">Agriculture Summary</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Farm Size', value: `${farm?.farmSize ?? member.farmSize ?? '—'} ha` },
            { label: 'Main Crops', value: (member.mainCrops || []).join(', ') || '—' },
            { label: 'Assigned Officer', value: member.assignedOfficerId?.name || '—' },
            { label: 'Registered', value: formatDate(member.createdAt) },
          ].map((item) => (
            <p key={item.label} className="flex justify-between border-b border-border-light pb-2">
              <span className="text-muted">{item.label}</span>
              <span className="font-semibold text-dark">{item.value}</span>
            </p>
          ))}
        </div>
        {member.notes && (
          <div className="mt-4 rounded-xl bg-subtle p-3 text-sm text-muted">
            {member.notes}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-3 text-base font-bold text-dark">Timeline</h3>
        {!history || !history.timeline || history.timeline.length === 0 ? (
          <p className="text-sm text-muted">No activity yet</p>
        ) : (
          <ul className="space-y-3">
            {history.timeline.slice(0, 8).map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-semibold text-dark capitalize">{item.title}</p>
                  <p className="text-xs text-muted">{item.detail}</p>
                  <p className="text-xs text-muted-light">{formatDate(item.date, true)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function FarmTab({ member, farm, onRefresh }) {
  const [open, setOpen] = useState(false)
  const crops = farm?.crops || []
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-dark">
          Farm Profile {farm?.farmSize ? `- ${farm.farmSize} ha` : ''}
        </h3>
        <Button size="sm" onClick={() => setOpen(true)}>Add Crop</Button>
      </div>
      {crops.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No crops recorded yet</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {crops.map((crop) => (
            <div key={crop._id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-dark">{crop.cropName}</h4>
                <span className="capitalize text-xs text-muted">{crop.status}</span>
              </div>
              {crop.variety && <p className="text-sm text-muted">{crop.variety}</p>}
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted">Area: <span className="font-semibold text-dark">{crop.areaHectares || '—'} ha</span></p>
                <p className="text-muted">Season: <span className="font-semibold text-dark">{crop.season || '—'}</span></p>
                <p className="text-muted">Est. Yield: <span className="font-semibold text-dark">{crop.estimatedYield || '—'}</span></p>
                <p className="text-muted">Actual: <span className="font-semibold text-dark">{crop.actualYield || '—'}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
      <AddCropModal open={open} onClose={() => setOpen(false)} memberId={member._id} onRefresh={onRefresh} />
    </div>
  )
}

function AddCropModal({ open, onClose, memberId, onRefresh }) {
  const [form, setForm] = useState({ cropName: '', variety: '', areaHectares: '', season: '', estimatedYield: '' })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!form.cropName) return
    setSaving(true)
    try {
      await api.post(`/farms/member/${memberId}/crops`, form)
      toast.success('Crop added')
      onClose()
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add crop')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Crop"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>Add Crop</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Crop *" options={CROPS.map((c) => ({ value: c, label: c }))} value={form.cropName} onChange={(e) => setForm((f) => ({ ...f, cropName: e.target.value }))} />
        <Input label="Variety" value={form.variety} onChange={(e) => setForm((f) => ({ ...f, variety: e.target.value }))} />
        <Input label="Area (ha)" type="number" value={form.areaHectares} onChange={(e) => setForm((f) => ({ ...f, areaHectares: e.target.value }))} />
        <Input label="Season" value={form.season} onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))} />
        <Input label="Estimated Yield" type="number" value={form.estimatedYield} onChange={(e) => setForm((f) => ({ ...f, estimatedYield: e.target.value }))} />
      </div>
    </Modal>
  )
}

function CollectionsTab({ collections }) {
  return (
    <div>
      <h3 className="mb-4 text-base font-bold text-dark">Collection History</h3>
      {collections.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No collections recorded</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full divide-y divide-border-light">
            <thead>
              <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Crop</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {collections.map((c) => (
                <tr key={c._id} className="hover:bg-subtle/30">
                  <td className="px-4 py-3 text-sm text-muted">{formatDate(c.date)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-dark">{c.crop}</td>
                  <td className="px-4 py-3 text-sm">{c.quantity} {c.unit}</td>
                  <td className="px-4 py-3 text-sm">{c.qualityGrade}</td>
                  <td className="px-4 py-3 text-sm">{c.pricePerUnit}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-dark">{formatCurrency(c.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function PaymentsTab({ payments }) {
  return (
    <div>
      <h3 className="mb-4 text-base font-bold text-dark">Payment History</h3>
      {payments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No payments recorded</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full divide-y divide-border-light">
            <thead>
              <tr className="bg-subtle/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-subtle/30">
                  <td className="px-4 py-3 text-sm text-muted">{formatDate(p.paymentDate)}</td>
                  <td className="px-4 py-3 text-sm capitalize">{p.type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-sm capitalize">{p.method.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-dark">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function LoansTab({ loans }) {
  return (
    <div>
      <h3 className="mb-4 text-base font-bold text-dark">Loans</h3>
      {loans.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No loans</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {loans.map((l) => (
            <div key={l._id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold capitalize text-dark">{l.type} Loan</h4>
                <Badge status={l.status} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted">Amount: <span className="font-semibold text-dark">{formatCurrency(l.amount)}</span></p>
                <p className="text-muted">Balance: <span className="font-semibold text-dark">{formatCurrency(l.balance)}</span></p>
                <p className="text-muted">Due: <span className="font-semibold text-dark">{formatDate(l.dueDate)}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DocumentsTab({ member, onRefresh }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('document', file)
      fd.append('title', file.name)
      await api.post(`/members/${member._id}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Document uploaded')
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-dark">Documents & Photos</h3>
        <Button size="sm" disabled={uploading} onClick={() => document.getElementById('doc-upload').click()}>
          <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        <input id="doc-upload" type="file" className="hidden" onChange={handleUpload} />
      </div>
      {member.documents?.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No documents attached</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {member.documents.map((doc) => (
            <a
              key={doc._id}
              href={doc.filePath}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border p-3 transition-colors hover:border-primary-300 hover:bg-primary-50/30"
            >
              <FileText className="h-8 w-8 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-dark">{doc.title || doc.fileName}</p>
                <p className="text-xs text-muted">{formatDate(doc.createdAt)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function CollectionModal({ open, onClose, memberId, onSaved }) {
  const [form, setForm] = useState({ crop: '', quantity: '', unit: 'kg', qualityGrade: 'A', pricePerUnit: '', collectionLocation: '', notes: '' })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)

  const totalValue = (Number(form.quantity) || 0) * (Number(form.pricePerUnit) || 0)

  const submit = async () => {
    if (!form.crop || !form.quantity) return
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
      fd.append('memberId', memberId)
      if (photo) fd.append('photo', photo)
      await api.post('/collections', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Collection recorded')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record collection')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Collection"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>Save Collection</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Crop *" options={CROPS.map((c) => ({ value: c, label: c }))} value={form.crop} onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))} />
        <div className="grid grid-cols-2 gap-2">
          <Input label="Quantity *" type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
          <Select label="Unit" options={['kg', 'lb', 'bag', 'tonne']} value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
        </div>
        <Select label="Grade" options={QUALITY_GRADES} value={form.qualityGrade} onChange={(e) => setForm((f) => ({ ...f, qualityGrade: e.target.value }))} />
        <Input label="Price per unit" type="number" step="any" value={form.pricePerUnit} onChange={(e) => setForm((f) => ({ ...f, pricePerUnit: e.target.value }))} />
        <Input label="Collection Location" value={form.collectionLocation} onChange={(e) => setForm((f) => ({ ...f, collectionLocation: e.target.value }))} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark">Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-dark outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary-100" />
        </div>
        <div className="sm:col-span-2">
          <Input label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="sm:col-span-2 flex justify-between rounded-xl bg-primary-50 px-4 py-3">
          <span className="text-sm font-semibold text-primary">Total Value</span>
          <span className="text-sm font-bold text-primary">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    </Modal>
  )
}
