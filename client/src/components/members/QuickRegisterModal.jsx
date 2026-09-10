import { useState } from 'react'
import { Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useAuth } from '../../context/AuthContext'

// Lightweight member registration for the field: name, phone, location and a
// photo. Officers get the member assigned to them automatically so the new
// record shows up under their workload immediately. For anything richer the
// full Registration page is still available.
export default function QuickRegisterModal({ open, onClose, onSaved }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    region: '',
    notes: '',
  })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async () => {
    if (!form.firstName.trim()) {
      toast.error('First name is required')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('firstName', form.firstName.trim())
      if (form.lastName) fd.append('lastName', form.lastName.trim())
      if (form.phone) fd.append('phone', form.phone.trim())
      if (form.location) fd.append('location', form.location.trim())
      if (form.region) fd.append('region', form.region.trim())
      if (form.notes) fd.append('notes', form.notes.trim())
      if (user?.role === 'fieldOfficer' && user?._id) {
        fd.append('assignedOfficerId', user._id)
      }
      if (photo) fd.append('photo', photo)
      const { data } = await api.post('/members', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(`Member registered — ${data.data.membershipNumber}`)
      onClose()
      if (onSaved) onSaved(data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quick Member Registration"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>Register Member</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 flex items-end gap-4">
          {photo ? (
            <img
              src={URL.createObjectURL(photo)}
              alt="preview"
              className="h-20 w-20 rounded-2xl border border-border object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-border bg-subtle text-muted">
              <Camera className="h-6 w-6" />
            </div>
          )}
          <label className="cursor-pointer rounded-lg bg-subtle px-3 py-2 text-xs font-semibold text-muted transition-colors hover:bg-border">
            {photo ? 'Change photo' : 'Add photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        <Input
          label="First name *"
          value={form.firstName}
          onChange={(e) => set('firstName', e.target.value)}
          placeholder="e.g. Ama"
        />
        <Input
          label="Last name"
          value={form.lastName}
          onChange={(e) => set('lastName', e.target.value)}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="e.g. 02X XXX XXXX"
        />
        <Input
          label="Village / Town"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
        />
        <Input
          label="Region"
          value={form.region}
          onChange={(e) => set('region', e.target.value)}
        />
        <div className="sm:col-span-2">
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Short note (crops, plot size, etc.)"
          />
        </div>
        <p className="sm:col-span-2 rounded-xl bg-subtle px-4 py-3 text-xs text-muted">
          Membership number is auto-generated. Officers' registrations are
          assigned to them automatically.
        </p>
      </div>
    </Modal>
  )
}