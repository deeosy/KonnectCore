import { ChevronDown } from 'lucide-react'

const Select = ({ label, error, options = [], placeholder, className = '', id, ...props }) => {
  const fieldId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-dark">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={fieldId}
          className={`w-full appearance-none rounded-xl border bg-surface px-4 py-3 pr-10 text-sm text-dark outline-none transition-all duration-150 focus:ring-2 ${
            error
              ? 'border-danger focus:border-danger focus:ring-danger-100'
              : 'border-border focus:border-primary focus:ring-primary-100'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const isObj = typeof opt === 'object'
            const value = isObj ? opt.value : opt
            const lbl = isObj ? opt.label : opt
            return (
              <option key={value} value={value}>
                {lbl}
              </option>
            )
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown className="h-4 w-4 text-muted-light" />
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}

export default Select
