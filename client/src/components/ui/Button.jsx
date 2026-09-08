import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary-light shadow-sm',
  secondary:
    'bg-secondary text-white hover:bg-secondary-hover focus-visible:ring-secondary-light shadow-sm',
  outline:
    'bg-surface text-dark border border-border hover:bg-subtle focus-visible:ring-muted-light',
  'outline-primary':
    'bg-transparent text-primary border border-primary hover:bg-primary-50 focus-visible:ring-primary-light',
  'outline-danger':
    'bg-transparent text-danger border border-danger hover:bg-danger-50 focus-visible:ring-danger-light',
  danger:
    'bg-danger text-white hover:bg-danger-700 focus-visible:ring-danger-light shadow-sm',
  ghost:
    'bg-transparent text-muted hover:bg-subtle hover:text-dark focus-visible:ring-muted-light',
  'ghost-primary':
    'bg-transparent text-primary hover:bg-primary-50 focus-visible:ring-primary-light',
}

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
  icon: 'h-10 w-10 rounded-xl',
  'icon-sm': 'h-8 w-8 rounded-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.015 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  )
}
