import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { MEMBER_STATUSES, CROPS } from '../utils/constants'

const emptyForm = {
  firstName: '',
  lastName: '',
  phone: '',
  membershipNumber: '',
  idType: 'national_id',
  idNumber: '',
  location: '',
  region: '',
  district: '',
  gpsLat: '',
  gpsLng: '',
  farmSize: '',
  mainCrops: [],
  groupId: '',
  assignedOfficerId: '',
  status: 'active',
  notes: '',
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

function FormSection({ title, children, delay = 0 }) {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className="rounded-3xl border border-border bg-surface p-6 shadow-card"
    >
      <h3 className="mb-5 text-base font-bold text-dark">{title}</h3>
      {children}
    </motion.div>
  )
}

export default function MemberNew() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const editId = id || new URLSearchParams(location.search).get('id')
  const isEdit = Boolean(editId)
  const [form, setForm] = useState(emptyForm)
  const [photo, setPhoto] = useState(null)
  const [groups, setGroups] = useState([])
  const [officers, setOfficers] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/groups').then(({ data }) => setGroups(data.data)).catch(() => {})
    api.get('/users').then(({ data }) => setOfficers(data.data)).catch(() => {})
    if (editId) {
      api.get(`/members/${editId}`).then(({ data }) => {
        const m = data.data
        setForm({
          firstName: m.firstName || '',
          lastName: m.lastName || '',
          phone: m.phone || '',
          membershipNumber: m.membershipNumber || '',
          idType: m.idType || 'national_id',
          idNumber: m.idNumber || '',
          location: m.location || '',
          region: m.region || '',
          district: m.district || '',
          gpsLat: m.gpsLat || '',
          gpsLng: m.gpsLng || '',
          farmSize: m.farmSize || '',
          mainCrops: m.mainCrops || [],
          groupId: m.groupId?._id || m.groupId || '',
          assignedOfficerId: m.assignedOfficerId?._id || m.assignedOfficerId || '',
          status: m.status || 'active',
          notes: m.notes || '',
        })
      }).catch(() => {
        toast.error('Failed to load member')
        navigate('/members')
      })
    }
  }, [editId, navigate])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleCropToggle = (crop) => {
    setForm((f) => ({
      ...f,
      mainCrops: f.mainCrops.includes(crop)
        ? f.mainCrops.filter((c) => c !== crop)
        : [...f.mainCrops, crop],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)) {
        fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v)
      }
    })
    if (photo) fd.append('photo', photo)
    try {
      const url = isEdit ? `/members/${editId}` : '/members'
      const method = isEdit ? 'put' : 'post'
      const { data } = await api[method](url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(isEdit ? 'Member updated' : 'Member registered')
      navigate(`/members/${data.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Member' : 'Register Member'}
        subtitle={isEdit ? 'Update member information' : 'Add a new member to your organisation'}
        action={
          <Button variant="outline" onClick={() => navigate(isEdit ? `/members/${editId}` : '/members')}>
            Cancel
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Personal Information" delay={0}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="First Name *" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
            <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            <Input label="Membership Number" value={form.membershipNumber} onChange={(e) => set('membershipNumber', e.target.value)} hint="Auto-generated if left blank" />
            <div className="grid grid-cols-2 gap-2">
              <Select label="ID Type" options={['national_id', 'voter_id', 'passport', 'other'].map((v) => ({ value: v, label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }))} value={form.idType} onChange={(e) => set('idType', e.target.value)} />
              <Input label="ID Number" value={form.idNumber} onChange={(e) => set('idNumber', e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-dark outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Location" delay={0.05}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Village / Town" value={form.location} onChange={(e) => set('location', e.target.value)} />
            <Input label="Region" value={form.region} onChange={(e) => set('region', e.target.value)} />
            <Input label="District" value={form.district} onChange={(e) => set('district', e.target.value)} />
            <Input label="GPS Latitude" type="number" step="any" value={form.gpsLat} onChange={(e) => set('gpsLat', e.target.value)} />
            <Input label="GPS Longitude" type="number" step="any" value={form.gpsLng} onChange={(e) => set('gpsLng', e.target.value)} />
          </div>
        </FormSection>

        <FormSection title="Agriculture" delay={0.1}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Farm Size (hectares)" type="number" step="any" value={form.farmSize} onChange={(e) => set('farmSize', e.target.value)} />
            <Select label="Group" placeholder="Select group" options={groups.map((g) => ({ value: g._id, label: g.name }))} value={form.groupId} onChange={(e) => set('groupId', e.target.value)} />
            <Select label="Assigned Officer" placeholder="Select officer" options={officers.map((o) => ({ value: o._id, label: o.name }))} value={form.assignedOfficerId} onChange={(e) => set('assignedOfficerId', e.target.value)} />
          </div>
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-dark">Main Crops</label>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => handleCropToggle(crop)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                    form.mainCrops.includes(crop)
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-border bg-surface text-muted hover:border-primary-300 hover:text-primary'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </FormSection>

        <FormSection title="Membership" delay={0.15}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Status" options={MEMBER_STATUSES} value={form.status} onChange={(e) => set('status', e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional notes about this member" />
            </div>
          </div>
        </FormSection>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger"
          >
            {error}
          </motion.div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(isEdit ? `/members/${editId}` : '/members')}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Member' : 'Register Member'}
          </Button>
        </div>
      </form>
    </div>
  )
}
