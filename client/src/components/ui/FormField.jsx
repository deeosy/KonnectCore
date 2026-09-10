// FormField wraps a form control with a consistent label, inline error and
// hint. Use it for fields built from bespoke markup (file inputs, chip
// toggles, search boxes) that the Input/Select components don't already cover.
// Input and Select accept label/error/hint directly, so they don't need
// FormField.
export default function FormField({ label, error, hint, required, children, className = '', htmlFor }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-dark">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}