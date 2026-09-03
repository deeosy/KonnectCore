import { Loader2 } from 'lucide-react'

export default function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <span className="text-sm font-medium text-navy-500">Loading...</span>
      </div>
    </div>
  )
}