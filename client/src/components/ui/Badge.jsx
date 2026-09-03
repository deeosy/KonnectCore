const statusStyles = {
  // member statuses
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-navy-50 text-navy-600 border-navy-200',
  suspended: 'bg-amber-50 text-amber-700 border-amber-200',
  blacklisted: 'bg-red-50 text-red-700 border-red-200',
  // payment statuses
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  part_paid: 'bg-brand-50 text-brand-700 border-brand-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  // loan statuses
  approved: 'bg-brand-50 text-brand-700 border-brand-200',
  disbursed: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  rejected: 'bg-navy-50 text-navy-600 border-navy-200',
  // task statuses
  in_progress: 'bg-brand-50 text-brand-700 border-brand-200',
}

export default function Badge({ status, label, className = '' }) {
  const style = statusStyles[status] || 'bg-navy-50 text-navy-600 border-navy-200'
  const text = label || (status ? status.replace(/_/g, ' ') : '')

  const capitalize = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style} ${className}`}
    >
      {capitalize(text)}
    </span>
  )
}