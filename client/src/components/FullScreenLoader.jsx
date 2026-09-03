import { Loader2, Sprout } from 'lucide-react'

export default function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <Sprout className="h-7 w-7 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted">Loading...</span>
        </div>
      </div>
    </div>
  )
}
