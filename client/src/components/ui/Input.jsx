const Input = ({ label, error, hint, className = '', id, ...props }) => {
  const fieldId = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1 block text-sm font-medium text-navy-700"
        >
          {label}
        </label>
      )}
      <input
        id={fieldId}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-navy-900 placeholder-navy-400 outline-none transition-colors focus:ring-2 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
            : 'border-navy-200 focus:border-brand-500 focus:ring-brand-100'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-navy-400">{hint}</p>}
    </div>
  )
}

export default Input