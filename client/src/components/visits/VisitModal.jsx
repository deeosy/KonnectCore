import { useEffect, useRef, useState } from 'react'
import { Search, User, MapPin, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

const PURPOSES = [
  'Scheduled check-in',
  'Farm inspection',
  'Collection / produce pickup',
  'Loan follow-up',
  'Registration / onboarding',
  'Field support / advisory',
  'Other',
]

// Records a field visit to a member. Any authenticated user (officer, manager,
// admin) can record one — officers are automatically attached (see backend),
// and the same member search combobox used on loans keeps the flow consistent.
export default function VisitModal({ open, onClose, onSaved, presetMember }) {
  const [form, setForm] = useState({
    memberId: '',
    purpose: PURPOSES[0],
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    gpsLat: '',
    gpsLng: '',
  })
  const [photos, setPhotos] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState([])
  const [pickedMember, setPickedMember] = useState(null)
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [saving, setSaving] = useState(false)
  const searchTimer = useRef(null)
  const photoInput = useRef(null)

  const presetMemberName = presetMember ? `${presetMember.firstName} ${presetMember.lastName}` : ''

  useEffect(() => {
    if (!open) return
    setForm({
      memberId: presetMember?._id || '',
      purpose: PURPOSES[0],
      date: new Date().toISOString().slice(0, 10),
      notes: '',
      gpsLat: '',
      gpsLng: '',
    })
    setPhotos([])
    setMemberSearch('')
    setMemberResults([])
    setPickedMember(presetMember || null)
  }, [open, presetMember])

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

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not available in this browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          gpsLat: pos.coords.latitude?.toFixed(6),
          gpsLng: pos.coords.longitude?.toFixed(6),
        }))
        setLocating(false)
        toast.success('Location captured')
      },
      () => {
        setLocating(false)
        toast.error('Could not get your location')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const submit = async () => {
    if (!form.memberId) {
      toast.error('Select a member')
      return
    }
    if (!form.notes.trim() && !form.purpose) {
      toast.error('Add a note or purpose for the visit')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('memberId', form.memberId)
      fd.append('purpose', form.purpose)
      fd.append('date', form.date || new Date())
      if (form.notes) fd.append('notes', form.notes)
      if (form.gpsLat) fd.append('gpsLat', form.gpsLat)
      if (form.gpsLng) fd.append('gpsLng', form.gpsLng)
      photos.forEach((p) => fd.append('photos', p))
      await api.post('/visits', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Visit recorded')
      onClose()
      if (onSaved) onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record visit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Field Visit"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>Save Visit</Button>
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
                      setPickedMember(m)
                      setMemberSearch('')
                      setMemberResults([])
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50"
                  >
                    <User className="h-4 w-4 text-muted" />
                    <span className="font-semibold text-dark">{m.firstName} {m.lastName}</span>
                    <span className="ml-auto text-xs text-muted">{m.membershipNumber || m.phone}</span>
                  </button>
                ))}
              </div>
            )}
            {form.memberId && pickedMember && !memberSearch && (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {pickedMember.firstName} {pickedMember.lastName}
                </span>
                <span className="ml-auto text-xs text-muted">
                  {pickedMember.membershipNumber || pickedMember.phone}
                </span>
              </div>
            )}
          </div>
        )}

        <Select
          label="Purpose"
          options={PURPOSES.map((p) => ({ value: p, label: p }))}
          value={form.purpose}
          onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
        />
        <Input
          label="Date *"
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
        <div className="sm:col-span-2">
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="What was discussed / observed…"
          />
        </div>

        <div className="sm:col-span-2 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-dark">Location (GPS)</p>
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-100 disabled:opacity-50"
            >
              <MapPin className="h-3.5 w-3.5" />
              {locating ? 'Capturing…' : 'Use my location'}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={form.gpsLat}
              onChange={(e) => setForm((f) => ({ ...f, gpsLat: e.target.value }))}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={form.gpsLng}
              onChange={(e) => setForm((f) => ({ ...f, gpsLng: e.target.value }))}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-dark">Photos</label>
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
            >
              <Camera className="h-3.5 w-3.5" />
              Add photo{photos.length ? ` (${photos.length})` : ''}
            </button>
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setPhotos(Array.from(e.target.files || []).slice(0, 5))}
            />
          </div>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <span key={i} className="rounded-full bg-subtle px-3 py-1 text-xs font-medium text-muted">
                  {p.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}