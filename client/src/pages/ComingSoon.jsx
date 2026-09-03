import { Construction } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'

export default function ComingSoon({ title, subtitle }) {
  return (
    <div>
      <PageHeader title={title || 'Page'} subtitle={subtitle} />
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface py-20">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
          <Construction className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-bold text-dark">Coming soon</p>
        <p className="mt-1 text-sm text-muted">
          This module is being built as part of the project plan.
        </p>
      </div>
    </div>
  )
}
