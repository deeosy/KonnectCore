export const formatCurrency = (value, currency = 'GHS') => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(value)
}

export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

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

export const formatDateTime = (value) => formatDate(value, true)

export const initials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export const truncate = (str = '', len = 40) => {
  if (!str) return ''
  return str.length > len ? str.substring(0, len) + '…' : str
}
