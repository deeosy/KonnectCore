import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500 disabled:hover:bg-brand-500',
  navy: 'bg-navy-900 text-white hover:bg-navy-800 focus-visible:ring-navy-900 disabled:hover:bg-navy-900',
  secondary:
    'bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 focus-visible:ring-brand-500',
  outline:
    'bg-white text-navy-700 border border-navy-200 hover:bg-navy-50 focus-visible:ring-navy-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 disabled:hover:bg-red-600',
  ghost: 'bg-transparent text-navy-600 hover:bg-navy-100 focus-visible:ring-navy-400',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
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
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}