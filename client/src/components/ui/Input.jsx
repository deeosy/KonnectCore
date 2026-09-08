import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, hint, icon: Icon, className = '', id, ...props }, ref) => {
  const fieldId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-sm font-medium text-dark"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon className="h-4 w-4 text-muted-light" />
          </div>
        )}
        <input
          ref={ref}
          id={fieldId}
          className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm text-dark placeholder-muted-light outline-none transition-all duration-150 focus:ring-2 ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-danger focus:border-danger focus:ring-danger-100'
              : 'border-border focus:border-primary focus:ring-primary-100'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
