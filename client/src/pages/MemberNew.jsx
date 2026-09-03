import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function MemberNew() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [photo, setPhoto] = useState(null)
  const [groups, setGroups] = useState([])
  const [officers, setOfficers] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/groups').then(({ data }) => setGroups(data.data)).catch(() => {})
    api.get('/users').then(({ data }) => setOfficers(data.data)).catch(() => {})
  }, [])

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
      const { data } = await api.post('/members', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/members/${data.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Register Member"
        subtitle="Add a new member to your organisation"
        action={
          <Button variant="outline" onClick={() => navigate('/members')}>
            Cancel
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-navy-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-navy-900">Personal Information</h3>
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
              <label className="mb-1 block text-sm font-medium text-navy-700">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-navy-900">Location</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Village / Town" value={form.location} onChange={(e) => set('location', e.target.value)} />
            <Input label="Region" value={form.region} onChange={(e) => set('region', e.target.value)} />
            <Input label="District" value={form.district} onChange={(e) => set('district', e.target.value)} />
            <Input label="GPS Latitude" type="number" step="any" value={form.gpsLat} onChange={(e) => set('gpsLat', e.target.value)} />
            <Input label="GPS Longitude" type="number" step="any" value={form.gpsLng} onChange={(e) => set('gpsLng', e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-navy-900">Agriculture</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Farm Size (hectares)" type="number" step="any" value={form.farmSize} onChange={(e) => set('farmSize', e.target.value)} />
            <Select label="Group" placeholder="Select group" options={groups.map((g) => ({ value: g._id, label: g.name }))} value={form.groupId} onChange={(e) => set('groupId', e.target.value)} />
            <Select label="Assigned Officer" placeholder="Select officer" options={officers.map((o) => ({ value: o._id, label: o.name }))} value={form.assignedOfficerId} onChange={(e) => set('assignedOfficerId', e.target.value)} />
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-navy-700">Main Crops</label>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => handleCropToggle(crop)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    form.mainCrops.includes(crop)
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-navy-200 bg-white text-navy-600 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-navy-900">Membership</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Status" options={MEMBER_STATUSES} value={form.status} onChange={(e) => set('status', e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional notes about this member" />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/members')}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {saving ? 'Saving...' : 'Register Member'}
          </Button>
        </div>
      </form>
    </div>
  )
}