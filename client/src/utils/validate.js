// Small form validators used by the modals. Each returns '' when the value is
// valid (so forms can display errors by truthiness) and a message otherwise.
// Empty strings/undefined/null values are treated as "no error" in the
// numeric and optional validators so fields only complain once filled.

// A non-blank value is required; returns '' when present.
export const required = (v, label = 'This field') =>
  v !== undefined && v !== null && String(v).trim() !== '' ? '' : `${label} is required`

// Value must be a number greater than zero; blank values stay valid.
export const positive = (v, label = 'Amount') => {
  if (v === '' || v === undefined || v === null) return ''
  const n = Number(v)
  if (Number.isNaN(n)) return `${label} must be a number`
  return n > 0 ? '' : `${label} must be greater than zero`
}

// Value must be a numeric zero or greater; blank values stay valid.
export const nonNegative = (v, label = 'Value') => {
  if (v === '' || v === undefined || v === null) return ''
  const n = Number(v)
  if (Number.isNaN(n)) return `${label} must be a number`
  return n >= 0 ? '' : `${label} cannot be negative`
}

// Latitude must be a number within the valid -90..90 range.
export const lat = (v) => {
  if (v === '' || v === undefined || v === null) return ''
  const n = Number(v)
  return Number.isNaN(n) ? 'Latitude must be a number' : n >= -90 && n <= 90 ? '' : 'Latitude must be between -90 and 90'
}

// Longitude must be a number within the valid -180..180 range.
export const lng = (v) => {
  if (v === '' || v === undefined || v === null) return ''
  const n = Number(v)
  return Number.isNaN(n) ? 'Longitude must be a number' : n >= -180 && n <= 180 ? '' : 'Longitude must be between -180 and 180'
}

// Phone must contain 9-13 digits (after stripping non-numeric characters);
// blank values stay valid.
export const phone = (v) => {
  if (v === '' || v === undefined || v === null) return ''
  const digits = String(v).replace(/[^0-9]/g, '')
  return digits.length >= 9 && digits.length <= 13 ? '' : 'Enter a valid phone number'
}

// A date value must be present (truthy).
export const requiredDate = (v) => (v ? '' : 'Please choose a date')

// A value must be present, used for dropdowns/selects; blank stays valid.
export const picked = (v, label = 'Please select') => (v ? '' : `${label}`)