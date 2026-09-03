import { Construction } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'

export default function ComingSoon({ title, subtitle }) {
  return (
    <div>
      <PageHeader title={title || 'Page'} subtitle={subtitle} />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-200 bg-white py-20">
        <Construction className="h-12 w-12 text-brand-400" />
        <p className="mt-4 text-lg font-semibold text-navy-700">Coming soon</p>
        <p className="mt-1 text-sm text-navy-400">
          This module is being built as part of the project plan.
        </p>
      </div>
    </div>
  )
}