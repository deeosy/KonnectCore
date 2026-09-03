import { useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

const reports = [
  { key: 'members', label: 'Member Report', desc: 'All members with contact details and status' },
  { key: 'collections', label: 'Collection / Harvest Report', desc: 'Harvests by crop, date, group and member' },
  { key: 'payments', label: 'Payment Report', desc: 'Payments by status and date range' },
  { key: 'groups', label: 'Group Summary', desc: 'Members, harvest and payment summaries by group' },
  { key: 'loans', label: 'Loan Report', desc: 'Loans outstanding, repaid and status' },
]

export default function ReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [exporting, setExporting] = useState('')

  const handleExport = async (key) => {
    setExporting(key)
    try {
      const params = new URLSearchParams({ format: 'xlsx' })
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/reports/${key}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${key}-report.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    } finally {
      setExporting('')
    }
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export reports" />
      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="From Date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To Date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => { setFrom(''); setTo('') }}
              className="w-full"
            >
              Clear Dates
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <div key={r.key} className="flex flex-col justify-between rounded-xl border border-navy-200 bg-white p-5 shadow-sm">
            <div>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-navy-900">{r.label}</h3>
              <p className="mt-1 text-sm text-navy-500">{r.desc}</p>
            </div>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              loading={exporting === r.key}
              onClick={() => handleExport(r.key)}
            >
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}