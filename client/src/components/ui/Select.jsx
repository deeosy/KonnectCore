const Select = ({ label, error, options = [], placeholder, className = '', id, ...props }) => {
  const fieldId = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="mb-1 block text-sm font-medium text-navy-700">
          {label}
        </label>
      )}
      <select
        id={fieldId}
        className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm text-navy-900 outline-none transition-colors focus:ring-2 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
            : 'border-navy-200 focus:border-brand-500 focus:ring-brand-100'
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
          const label = isObj ? opt.label : opt
          return (
            <option key={value} value={value}>
              {label}
            </option>
          )
        })}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Select