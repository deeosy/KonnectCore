import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, sub, accent = 'primary', className = '' }) {
  const accents = {
    primary: { bg: 'bg-primary-50', text: 'text-primary', value: 'text-dark' },
    success: { bg: 'bg-success-50', text: 'text-success', value: 'text-dark' },
    warning: { bg: 'bg-warning-50', text: 'text-warning-600', value: 'text-dark' },
    danger: { bg: 'bg-danger-50', text: 'text-danger', value: 'text-dark' },
    info: { bg: 'bg-info-50', text: 'text-secondary', value: 'text-dark' },
    dark: { bg: 'bg-dark', text: 'text-white', value: 'text-white' },
  }

  const a = accents[accent] || accents.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-3xl border border-border bg-surface p-6 shadow-card ${className}`}
    >
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${a.bg}`}>
        <Icon className={`h-5 w-5 ${a.text}`} />
      </div>
      <p className={`text-2xl font-bold tracking-tight ${a.value}`}>{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      {sub && <p className="mt-2 text-xs font-semibold text-primary">{sub}</p>}
    </motion.div>
  )
}
