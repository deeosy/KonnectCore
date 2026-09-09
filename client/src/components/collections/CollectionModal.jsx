import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, User } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { formatCurrency } from '../../utils/format'
import { CROPS as DEFAULT_CROPS, QUALITY_GRADES } from '../../utils/constants'

const dateInputValue = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

// Shared "Record / Edit Collection" form used on the member profile, the
// Collections page and the quick-add route (/collections/new). Supports back-
// dating, member lookup when no member is preset, auto-fill of the
// organisation's default crop price and photo upload.
export default function CollectionModal({ open, onClose, onSaved, member, collection }) {
  const [form, setForm] = useState({
    crop: '',
    quantity: '',
    unit: 'kg',
    qualityGrade: 'A',
    pricePerUnit: '',
    date: dateInputValue(new Date()),
    collectionLocation: '',
    gpsLat: '',
    gpsLng: '',
    notes: '',
  })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [orgSettings, setOrgSettings] = useState(null)
  const [catalogCrops, setCatalogCrops] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState([])
  const [searching, setSearching] = useState(false)
  const searchTimer = useRef(null)
  const manualPrice = useRef(false)

  const isEdit = !!collection
  const presetMemberId = isEdit ? collection.memberId?._id : member?._id
  const presetMemberName = isEdit
    ? collection.memberId
      ? `${collection.memberId.firstName} ${collection.memberId.lastName}`
      : ''
    : member
      ? `${member.firstName} ${member.lastName}`
      : ''

  const crops = useMemo(() => {
    const names = new Set([...DEFAULT_CROPS, ...catalogCrops])
    return [...names]
  }, [catalogCrops])

  const grades = useMemo(() => {
    const list = orgSettings?.qualityGrades?.length ? orgSettings.qualityGrades : QUALITY_GRADES.map((g) => g.value)
    return list.map((g) => ({ value: g, label: g === 'premium' ? 'Premium' : g === 'standard' ? 'Standard' : g === 'reject' ? 'Reject' : `Grade ${g}` }))
  }, [orgSettings])

  // Load org settings + the crop catalog once the modal opens.
  useEffect(() => {
    if (!open) return
    manualPrice.current = false
    Promise.all([
      api.get('/organisations/settings').then((r) => r.data.data).catch(() => null),
      api.get('/crops?active=true').then((r) => r.data.data.map((c) => c.name)).catch(() => []),
    ])
      .then(([settings, cropNames]) => {
        setOrgSettings(settings)
        setCatalogCrops(cropNames)
        if (settings?.defaultCropPrices) manualPrice.current = Object.keys(settings.defaultCropPrices).length === 0
      })
      .catch(() => {})
  }, [open])

  // Reset the form on every open, and prefill when editing an existing record.
  useEffect(() => {
    if (!open) return
    setForm(
      collection
        ? {
            memberId: collection.memberId?._id || '',
            crop: collection.crop || '',
            quantity: collection.quantity ?? '',
            unit: collection.unit || 'kg',
            qualityGrade: collection.qualityGrade || 'A',
            pricePerUnit: collection.pricePerUnit ?? '',
            date: dateInputValue(collection.date) || dateInputValue(new Date()),
            collectionLocation: collection.collectionLocation || '',
            gpsLat: collection.gpsLat ?? '',
            gpsLng: collection.gpsLng ?? '',
            notes: collection.notes || '',
          }
        : {
            memberId: member?._id || '',
            crop: '',
            quantity: '',
            unit: 'kg',
            qualityGrade: 'A',
            pricePerUnit: '',
            date: dateInputValue(new Date()),
            collectionLocation: '',
            gpsLat: '',
            gpsLng: '',
            notes: '',
          },
    )
    setPhoto(null)
    setMemberSearch('')
    setMemberResults([])
  }, [open, collection, member])

  const applyDefaultPrice = (crop, current = '') => {
    if (manualPrice.current && current !== '') return
    const price = orgSettings?.defaultCropPrices?.[crop]
    if (!price && !!current) return
    manualPrice.current = false
    setForm((f) => ({ ...f, crop, pricePerUnit: price != null ? price : f.pricePerUnit }))
  }

  const searchMembers = (term) => {
    setMemberSearch(term)
    clearTimeout(searchTimer.current)
    if (!term.trim()) {
      setMemberResults([])
      return
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await api.get(`/members?search=${encodeURIComponent(term)}&limit=6`)
        setMemberResults(data.data || [])
      } catch {
        setMemberResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
  }

  const selectedMember = memberResults.find((m) => m._id === form.memberId)

  const totalValue = (Number(form.quantity) || 0) * (Number(form.pricePerUnit) || 0)

  const submit = async () => {
    if (!form.crop || !form.quantity || !form.memberId) {
      toast.error('Select a member, crop and quantity')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v != null) fd.append(k, v)
      })
      if (photo) fd.append('photo', photo)

      if (isEdit) {
        await api.put(`/collections/${collection._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Collection updated')
      } else {
        await api.post('/collections', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Collection recorded')
      }
      onClose()
      if (onSaved) onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save collection')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Collection' : 'Record Collection'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            {isEdit ? 'Save Changes' : 'Save Collection'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {presetMemberName ? (
          <div className="sm:col-span-2 rounded-xl border border-border bg-subtle/50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Member</p>
            <p className="mt-0.5 text-sm font-bold text-dark">{presetMemberName}</p>
          </div>
        ) : (
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-dark">Member *</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
              <input
                value={memberSearch}
                onChange={(e) => searchMembers(e.target.value)}
                placeholder="Search member by name or phone…"
                className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-dark outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary-100"
              />
            </div>
            {searching && <p className="mt-1.5 text-xs text-muted">Searching…</p>}
            {memberResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-border">
                {memberResults.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => {
                      setForm((f) => ({ ...f, memberId: m._id }))
                      setMemberSearch('')
                      setMemberResults([])
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 ${selectedMember?._id === m._id ? 'bg-primary-50' : ''}`}
                  >
                    <User className="h-4 w-4 text-muted" />
                    <span className="font-semibold text-dark">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className="ml-auto text-xs text-muted">{m.membershipNumber || m.phone}</span>
                  </button>
                ))}
              </div>
            )}
            {form.memberId && !selectedMember && (
              <p className="mt-1.5 text-xs font-medium text-primary">Selected — search again to change</p>
            )}
          </div>
        )}
        <Select
          label="Crop *"
          placeholder="Select crop"
          options={crops}
          value={form.crop}
          onChange={(e) => applyDefaultPrice(e.target.value, form.pricePerUnit)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Quantity *"
            type="number"
            min="0"
            step="any"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          />
          <Select
            label="Unit"
            options={['kg', 'lb', 'bag', 'tonne']}
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          />
        </div>
        <Select
          label="Grade"
          options={grades}
          value={form.qualityGrade}
          onChange={(e) => setForm((f) => ({ ...f, qualityGrade: e.target.value }))}
        />
        <Input
          label="Price per unit"
          type="number"
          min="0"
          step="any"
          value={form.pricePerUnit}
          onChange={(e) => {
            manualPrice.current = true
            setForm((f) => ({ ...f, pricePerUnit: e.target.value }))
          }}
          hint={orgSettings?.defaultCropPrices?.[form.crop] ? `Default: ${formatCurrency(orgSettings.defaultCropPrices[form.crop])}` : undefined}
        />
        <Input
          label="Collection date *"
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          hint="Defaults to today; choose an earlier date to back-date"
        />
        <Input
          label="Collection Location"
          value={form.collectionLocation}
          onChange={(e) => setForm((f) => ({ ...f, collectionLocation: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="GPS latitude"
            type="number"
            step="any"
            value={form.gpsLat}
            onChange={(e) => setForm((f) => ({ ...f, gpsLat: e.target.value }))}
          />
          <Input
            label="GPS longitude"
            type="number"
            step="any"
            value={form.gpsLng}
            onChange={(e) => setForm((f) => ({ ...f, gpsLng: e.target.value }))}
          />
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
        <div className="sm:col-span-2">
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2 flex justify-between rounded-xl bg-primary-50 px-4 py-3">
          <span className="text-sm font-semibold text-primary">Total Value</span>
          <span className="text-sm font-bold text-primary">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    </Modal>
  )
}