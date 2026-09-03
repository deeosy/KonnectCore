import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-xl ${sizes[size]}`}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-navy-100 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}