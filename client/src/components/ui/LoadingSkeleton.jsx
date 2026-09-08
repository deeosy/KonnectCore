export default function LoadingSkeleton({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-10 shrink-0 animate-pulse-soft rounded-2xl bg-subtle" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse-soft rounded-lg bg-subtle" />
            <div className="h-3 w-1/2 animate-pulse-soft rounded-lg bg-subtle" />
          </div>
        </div>
      ))}
    </div>
  )
}
