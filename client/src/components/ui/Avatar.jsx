import { initials } from '../../utils/format'

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const colorClasses = [
  'bg-primary text-white',
  'bg-secondary text-white',
  'bg-success text-white',
  'bg-warning-600 text-white',
  'bg-danger text-white',
  'bg-dark text-white',
]

function getColorFromName(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colorClasses[Math.abs(hash) % colorClasses.length]
}

export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold ${sizeClasses[size]} ${getColorFromName(name)} ${className}`}
    >
      {initials(name)}
    </div>
  )
}
