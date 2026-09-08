const statusStyles = {
  active: 'bg-success-50 text-success-700 border-success-200',
  inactive: 'bg-subtle text-muted border-border',
  suspended: 'bg-warning-50 text-warning-700 border-warning-200',
  blacklisted: 'bg-danger-50 text-danger-700 border-danger-200',
  pending: 'bg-warning-50 text-warning-700 border-warning-200',
  paid: 'bg-success-50 text-success-700 border-success-200',
  part_paid: 'bg-primary-50 text-primary-700 border-primary-200',
  cancelled: 'bg-danger-50 text-danger-700 border-danger-200',
  approved: 'bg-primary-50 text-primary-700 border-primary-200',
  disbursed: 'bg-info-50 text-secondary-700 border-info-100',
  completed: 'bg-success-50 text-success-700 border-success-200',
  overdue: 'bg-danger-50 text-danger-700 border-danger-200',
  rejected: 'bg-subtle text-muted border-border',
  in_progress: 'bg-primary-50 text-primary-700 border-primary-200',
  info: 'bg-info-50 text-secondary-700 border-info-100',
}

export default function Badge({ status, label, className = '' }) {
  const style = statusStyles[status] || 'bg-subtle text-muted border-border'
  const text = label || (status ? status.replace(/_/g, ' ') : '')

  const capitalize = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${style} ${className}`}
    >
      {capitalize(text)}
    </span>
  )
}
