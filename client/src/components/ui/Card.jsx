export default function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`rounded-xl border border-navy-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-navy-900">{title}</h3>
            )}
            {subtitle && <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}