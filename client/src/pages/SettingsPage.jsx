import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Trash2, Plus, Settings as SettingsIcon, Building2, Coins } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { CROPS } from '../utils/constants'

const emptyProfile = {
  name: '',
  code: '',
  location: '',
  region: '',
  district: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
}

export default function SettingsPage() {
  const { user } = useAuth()
  const orgId = user?.organisationId

  const [profile, setProfile] = useState(emptyProfile)
  const [currency, setCurrency] = useState('GHS')
  const [prices, setPrices] = useState([])
  const [grades, setGrades] = useState([])
  const [seasons, setSeasons] = useState([])
  const [deductions, setDeductions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')

  useEffect(() => {
    let active = true
    if (!orgId) return undefined
    Promise.all([
      api.get(`/organisations/${orgId}`),
      api.get('/organisations/settings'),
    ])
      .then(([orgRes, settingsRes]) => {
        if (!active) return
        const org = orgRes.data?.data || {}
        const settings = settingsRes.data?.data || {}
        setProfile({
          name: org.name || '',
          code: org.code || '',
          location: org.location || '',
          region: org.region || '',
          district: org.district || '',
          contactName: org.contactName || '',
          contactPhone: org.contactPhone || '',
          contactEmail: org.contactEmail || '',
        })
        setCurrency(settings.currency || 'GHS')
        const crops = (settings.defaultCropPrices && Object.keys(settings.defaultCropPrices).length
          ? Object.entries(settings.defaultCropPrices).map(([crop, price]) => ({ crop, price: String(price) }))
          : CROPS.map((c) => ({ crop: c, price: '' })))
        setPrices(crops)
        setGrades(settings.qualityGrades || ['A', 'B', 'C'])
        setSeasons(settings.seasons || ['Major', 'Minor'])
        setDeductions(settings.deductionRules && Object.keys(settings.deductionRules).length
          ? Object.entries(settings.deductionRules).map(([label, value]) => ({ label, value: String(value) }))
          : [{ label: '', value: '' }])
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load settings'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [orgId])

  const setProfileField = (key, value) => setProfile((p) => ({ ...p, [key]: value }))

  const saveProfile = async () => {
    setSaving('profile')
    try {
      await api.put(`/organisations/${orgId}`, profile)
      toast.success('Organisation profile saved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving('')
    }
  }

  const saveSettings = async () => {
    setSaving('settings')
    try {
      const defaultCropPrices = Object.fromEntries(
        prices
          .filter((p) => p.price !== '' && p.price !== null)
          .map((p) => [p.crop, Number(p.price)]),
      )
      const deductionRules = Object.fromEntries(
        deductions
          .filter((d) => d.label.trim() && d.value !== '')
          .map((d) => [d.label.trim(), Number(d.value)]),
      )
      await api.put('/organisations/settings', {
        currency,
        defaultCropPrices,
        qualityGrades: grades.filter((g) => g.trim()),
        seasons: seasons.filter((s) => s.trim()),
        deductionRules,
      })
      toast.success('System configuration saved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving('')
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Settings" subtitle="Organisation profile and system configuration" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 animate-pulse-soft rounded-3xl bg-subtle" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Organisation profile and system configuration" />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Organisation Profile"
          subtitle="Basic details shown across the platform"
          icon={<Building2 className="h-5 w-5" />}
        >
          <div className="-mx-6 -mb-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Organisation Name" value={profile.name} onChange={(e) => setProfileField('name', e.target.value)} />
              <Input label="Code" value={profile.code} onChange={(e) => setProfileField('code', e.target.value)} />
              <Input label="Location" value={profile.location} onChange={(e) => setProfileField('location', e.target.value)} />
              <Input label="Region" value={profile.region} onChange={(e) => setProfileField('region', e.target.value)} />
              <Input label="District" value={profile.district} onChange={(e) => setProfileField('district', e.target.value)} />
              <Input label="Contact Name" value={profile.contactName} onChange={(e) => setProfileField('contactName', e.target.value)} />
              <Input label="Contact Phone" value={profile.contactPhone} onChange={(e) => setProfileField('contactPhone', e.target.value)} />
              <Input label="Contact Email" value={profile.contactEmail} onChange={(e) => setProfileField('contactEmail', e.target.value)} />
            </div>
            <Button className="mt-5" loading={saving === 'profile'} onClick={saveProfile}>
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        </Card>

        <Card
          title="System Configuration"
          subtitle="Currency, prices, grades, seasons and deductions"
          icon={<SettingsIcon className="h-5 w-5" />}
        >
          <div className="-mx-6 -mb-6 p-6">
            <Input
              label="Currency"
              value={currency}
              maxLength={3}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            />

            <p className="mb-2 mt-6 text-sm font-medium text-dark">Default Crop Prices (GHS)</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {prices.map((row, i) => (
                <div key={row.crop} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 text-sm text-muted">{row.crop}</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.price}
                    onChange={(e) => {
                      const next = [...prices]
                      next[i] = { ...row, price: e.target.value }
                      setPrices(next)
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 mt-6 text-sm font-medium text-dark">Quality Grades</p>
                <ChipEditor items={grades} onChange={setGrades} placeholder="e.g. Premium" />
              </div>
              <div>
                <p className="mb-2 mt-6 text-sm font-medium text-dark">Seasons</p>
                <ChipEditor items={seasons} onChange={setSeasons} placeholder="e.g. Minor" />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-dark">Deduction Rules</p>
                <Button
                  variant="outline"
                  className="!px-3 !py-1.5 !text-xs"
                  onClick={() => setDeductions((d) => [...d, { label: '', value: '' }])}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Rule
                </Button>
              </div>
              <div className="space-y-2">
                {deductions.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      className="flex-1"
                      placeholder="Label (e.g. Loan repayment)"
                      value={d.label}
                      onChange={(e) => {
                        const next = [...deductions]
                        next[i] = { ...d, label: e.target.value }
                        setDeductions(next)
                      }}
                    />
                    <Input
                      className="w-28"
                      type="number"
                      step="0.01"
                      placeholder="Value"
                      value={d.value}
                      onChange={(e) => {
                        const next = [...deductions]
                        next[i] = { ...d, value: e.target.value }
                        setDeductions(next)
                      }}
                    />
                    <Button
                      variant="outline"
                      className="!px-2.5 !py-2.5"
                      onClick={() => setDeductions((list) => list.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button className="mt-6" loading={saving === 'settings'} onClick={saveSettings}>
              <Coins className="h-4 w-4" /> Save Configuration
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function ChipEditor({ items, onChange, placeholder }) {
  const [draft, setDraft] = useState('')
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary"
          >
            {item}
            <button
              type="button"
              className="text-primary/60 hover:text-primary"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          className="flex-1 !py-2"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button
          variant="outline"
          className="!px-3 !py-2"
          onClick={() => {
            const value = draft.trim()
            if (!value) return
            onChange([...items, value])
            setDraft('')
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}