export const required = (v, label = 'This field') =>
  v !== undefined && v !== null && String(v).trim() !== '' ? '' : `${label} is required`

export const positive = (v, label = 'Amount') => {
  if (v === '' || v === undefined || v === null) return ''
  const n = Number(v)
  if (Number.isNaN(n)) return `${label} must be a number`
  return n > 0 ? '' : `${label} must be greater than zero`
}

export const nonNegative = (v, label = 'Value') => {
  if (v === '' || v === undefined || v === null) return ''
  const n = Number(v)
  if (Number.isNaN(n)) return `${label} must be a number`
  return n >= 0 ? '' : `${label} cannot be negative`
}

export const lat = (v) => {
  if (v === '' || v === undefined || v === null) return ''
  const n = Number(v)
  return Number.isNaN(n) ? 'Latitude must be a number' : n >= -90 && n <= 90 ? '' : 'Latitude must be between -90 and 90'
}

export const lng = (v) => {
  if (v === '' || v === undefined || v === null) return ''
  const n = Number(v)
  return Number.isNaN(n) ? 'Longitude must be a number' : n >= -180 && n <= 180 ? '' : 'Longitude must be between -180 and 180'
}

export const phone = (v) => {
  if (v === '' || v === undefined || v === null) return ''
  const digits = String(v).replace(/[^0-9]/g, '')
  return digits.length >= 9 && digits.length <= 13 ? '' : 'Enter a valid phone number'
}

export const requiredDate = (v) => (v ? '' : 'Please choose a date')

export const picked = (v, label = 'Please select') => (v ? '' : `${label}`)