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
  MapPin as MapIcon,
} from 'lucide-react'
import api from '../services/api'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { formatCurrency, formatDate, initials } from '../utils/format'
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
  const [newCropOpen, setNewCropOpen] = useState(false)

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
        <div className="h-8 w-64 animate-pulse rounded bg-navy-100" />
        <div className="h-48 animate-pulse rounded-xl bg-navy-100" />
      </div>
    )
  }

  if (!member) {
    return <div className="text-navy-500">Member not found</div>
  }

  const infoItems = [
    { icon: Phone, label: 'Phone', value: member.phone || '—' },
    { icon: Hash, label: 'ID Number', value: `${member.idType || ''} ${member.idNumber || ''}`.trim() || '—' },
    { icon: MapPin, label: 'Location', value: [member.location, member.district, member.region].filter(Boolean).join(', ') || '—' },
    { icon: MapIcon, label: 'GPS', value: member.gpsLat ? `${member.gpsLat}, ${member.gpsLng}` : '—' },
  ]

  return (
    <div>
      <button
        onClick={() => navigate('/members')}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-navy-500 transition-colors hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </button>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-navy-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {member.photo ? (
            <img src={member.photo} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
              {initials(`${member.firstName} ${member.lastName}`)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              {member.firstName} {member.lastName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge status={member.status} />
              <span className="text-sm text-navy-400">#{member.membershipNumber}</span>
              {member.groupId && (
                <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                  {member.groupId.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setNewCropOpen(false)}>Edit</Button>
          <Button onClick={() => setCollectionOpen(true)}>Record Collection</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {infoItems.map((item) => (
          <div key={item.label} className="rounded-xl border border-navy-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-navy-400">
              <item.icon className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">{item.label}</span>
            </div>
            <p className="mt-1 truncate text-sm font-medium text-navy-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-navy-200 bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-brand-500 text-white' : 'text-navy-600 hover:bg-navy-50'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab === 'overview' && (
          <OverviewTab member={member} farm={farm} officers={history?.visits || []} history={history} />
        )}
        {tab === 'farm' && <FarmTab member={member} farm={farm} />}
        {tab === 'collections' && <CollectionsTab collections={history?.collections || []} member={member} />}
        {tab === 'payments' && <PaymentsTab payments={history?.payments || []} />}
        {tab === 'loans' && <LoansTab loans={history?.loans || []} />}
        {tab === 'documents' && <DocumentsTab member={member} />}
      </Card>

      {/* Record Collection Modal */}
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
        <h3 className="mb-3 text-base font-semibold text-navy-900">Agriculture Summary</h3>
        <div className="space-y-2 text-sm">
          <p className="flex justify-between border-b border-navy-100 pb-2">
            <span className="text-navy-500">Farm Size</span>
            <span className="font-medium">
              {farm?.farmSize ?? member.farmSize ?? '—'} ha
            </span>
          </p>
          <p className="flex justify-between border-b border-navy-100 pb-2">
            <span className="text-navy-500">Main Crops</span>
            <span className="font-medium">{(member.mainCrops || []).join(', ') || '—'}</span>
          </p>
          <p className="flex justify-between border-b border-navy-100 pb-2">
            <span className="text-navy-500">Assigned Officer</span>
            <span className="font-medium">{member.assignedOfficerId?.name || '—'}</span>
          </p>
          <p className="flex justify-between border-b border-navy-100 pb-2">
            <span className="text-navy-500">Registered</span>
            <span className="font-medium">{formatDate(member.createdAt)}</span>
          </p>
        </div>
        {member.notes && (
          <div className="mt-4 rounded-lg bg-navy-50 p-3 text-sm text-navy-600">
            {member.notes}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-3 text-base font-semibold text-navy-900">Timeline</h3>
        {(!history || history.timeline.length === 0) ? (
          <p className="text-sm text-navy-400">No activity yet</p>
        ) : (
          <ul className="space-y-3">
            {history.timeline.slice(0, 8).map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                <div>
                  <p className="text-sm font-medium text-navy-900 capitalize">
                    {item.title}
                  </p>
                  <p className="text-xs text-navy-500">{item.detail}</p>
                  <p className="text-xs text-navy-300">{formatDate(item.date, true)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function FarmTab({ member, farm }) {
  const [open, setOpen] = useState(false)
  const crops = farm?.crops || []
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-navy-900">
          Farm Profile {farm?.farmSize ? `- ${farm.farmSize} ha` : ''}
        </h3>
        <Button size="sm" onClick={() => setOpen(true)}>Add Crop</Button>
      </div>
      {crops.length === 0 ? (
        <p className="py-6 text-center text-sm text-navy-400">No crops recorded yet</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {crops.map((crop) => (
            <div key={crop._id} className="rounded-lg border border-navy-200 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-navy-900">{crop.cropName}</h4>
                <span className="capitalize text-xs text-navy-400">{crop.status}</span>
              </div>
              {crop.variety && <p className="text-sm text-navy-500">{crop.variety}</p>}
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <p className="text-navy-500">Area: <span className="font-medium text-navy-900">{crop.areaHectares || '—'} ha</span></p>
                <p className="text-navy-500">Season: <span className="font-medium text-navy-900">{crop.season || '—'}</span></p>
                <p className="text-navy-500">Est. Yield: <span className="font-medium text-navy-900">{crop.estimatedYield || '—'}</span></p>
                <p className="text-navy-500">Actual: <span className="font-medium text-navy-900">{crop.actualYield || '—'}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
      <AddCropModal
        open={open}
        onClose={() => setOpen(false)}
        memberId={member._id}
      />
    </div>
  )
}

function AddCropModal({ open, onClose, memberId }) {
  const [form, setForm] = useState({ cropName: '', variety: '', areaHectares: '', season: '', estimatedYield: '' })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!form.cropName) return
    setSaving(true)
    try {
      await api.post(`/farms/member/${memberId}/crops`, form)
      onClose()
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add crop')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Crop"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={saving} onClick={submit}>Add Crop</Button></>}
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

function CollectionsTab({ collections, member }) {
  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-navy-900">Collection History</h3>
      {collections.length === 0 ? (
        <p className="py-6 text-center text-sm text-navy-400">No collections recorded</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-100">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase text-navy-500">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Crop</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Grade</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {collections.map((c) => (
                <tr key={c._id}>
                  <td className="py-2.5 pr-4 text-sm text-navy-600">{formatDate(c.date)}</td>
                  <td className="py-2.5 pr-4 text-sm font-medium text-navy-900">{c.crop}</td>
                  <td className="py-2.5 pr-4 text-sm">{c.quantity} {c.unit}</td>
                  <td className="py-2.5 pr-4 text-sm">{c.qualityGrade}</td>
                  <td className="py-2.5 pr-4 text-sm">{c.pricePerUnit}</td>
                  <td className="py-2.5 pr-4 text-sm font-medium">{formatCurrency(c.totalValue)}</td>
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
      <h3 className="mb-4 text-base font-semibold text-navy-900">Payment History</h3>
      {payments.length === 0 ? (
        <p className="py-6 text-center text-sm text-navy-400">No payments recorded</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-100">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase text-navy-500">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="py-2.5 pr-4 text-sm text-navy-600">{formatDate(p.paymentDate)}</td>
                  <td className="py-2.5 pr-4 text-sm capitalize">{p.type.replace(/_/g, ' ')}</td>
                  <td className="py-2.5 pr-4 text-sm capitalize">{p.method.replace(/_/g, ' ')}</td>
                  <td className="py-2.5 pr-4 text-sm font-medium">{formatCurrency(p.amount)}</td>
                  <td className="py-2.5 pr-4"><Badge status={p.status} /></td>
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
      <h3 className="mb-4 text-base font-semibold text-navy-900">Loans</h3>
      {loans.length === 0 ? (
        <p className="py-6 text-center text-sm text-navy-400">No loans</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {loans.map((l) => (
            <div key={l._id} className="rounded-lg border border-navy-200 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold capitalize text-navy-900">{l.type} Loan</h4>
                <Badge status={l.status} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <p className="text-navy-500">Amount: <span className="font-medium">{formatCurrency(l.amount)}</span></p>
                <p className="text-navy-500">Balance: <span className="font-medium">{formatCurrency(l.balance)}</span></p>
                <p className="text-navy-500">Due: <span className="font-medium">{formatDate(l.dueDate)}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DocumentsTab({ member }) {
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
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-navy-900">Documents & Photos</h3>
        <Button size="sm" disabled={uploading} onClick={() => document.getElementById('doc-upload').click()}>
          <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        <input id="doc-upload" type="file" className="hidden" onChange={handleUpload} />
      </div>
      {member.documents?.length === 0 ? (
        <p className="py-6 text-center text-sm text-navy-400">No documents attached</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {member.documents.map((doc) => (
            <a
              key={doc._id}
              href={doc.filePath}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg border border-navy-200 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
            >
              <FileText className="h-8 w-8 shrink-0 text-brand-500" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy-900">{doc.title || doc.fileName}</p>
                <p className="text-xs text-navy-400">{formatDate(doc.createdAt)}</p>
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
      onSaved()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record collection')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Collection"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={saving} onClick={submit}>Save Collection</Button></>}
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
          <label className="mb-1 block text-sm font-medium text-navy-700">Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <Input label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="sm:col-span-2 flex justify-between rounded-lg bg-brand-50 px-4 py-3">
          <span className="text-sm font-medium text-brand-700">Total Value</span>
          <span className="text-sm font-bold text-brand-700">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    </Modal>
  )
}