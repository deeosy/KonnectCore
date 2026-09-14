/*
 * Drawer - Slide-in panel that overlays content from the left or right.
 * Props: open (boolean), onClose, title, children, size ('sm'|'md'|'lg'|'xl'), side ('left'|'right').
 */
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Drawer({ open, onClose, title, children, size = 'md', side = 'right' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      // Close the drawer when the user presses the Escape key
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    // Lock body scroll while the drawer is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  // Determine slide direction based on which side the drawer opens from
  const slideFrom = side === 'left' ? { x: '-100%' } : { x: '100%' }

  return (
    <AnimatePresence>
      {/* AnimatePresence enables exit animations when `open` becomes false */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop overlay: clicking it triggers onClose */}
          <motion.div
            className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} flex h-full w-full flex-col bg-surface shadow-xl ${sizes[size]}`}
            initial={slideFrom}
            animate={{ x: 0 }}
            exit={slideFrom}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-border-light px-6 py-5">
              <h3 className="text-lg font-bold text-dark">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-muted transition-colors hover:bg-subtle hover:text-dark"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
