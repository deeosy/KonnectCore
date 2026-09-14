// Formatting helpers for currency, numbers and dates. All return an em-dash
// (—) for missing/invalid input so tables render gracefully.

// Format a value as GHS with the en-GH locale; null/undefined become '—'.
export const formatCurrency = (value, currency = 'GHS') => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(value)
}

// Format a number with en-GH thousands separators and a fixed decimal count.
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// Format a date using the en-GB (day-mon-year) style, optionally including
// the time. Invalid or empty dates render as '—'.
export const formatDate = (value, withTime = false) => {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

// Shorthand for date-with-time formatting.
export const formatDateTime = (value) => formatDate(value, true)

// Derive up to two initials (e.g. "Ama Mensah" -> "AM") for avatars/badges.
export const initials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// Truncate a string to len characters with an ellipsis.
export const truncate = (str = '', len = 40) => {
  if (!str) return ''
  return str.length > len ? str.substring(0, len) + '…' : str
}
