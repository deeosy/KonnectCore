import { motion } from 'framer-motion'

export default function Card({ children, className = '', title, subtitle, action, hover = false, ...props }) {
  const Wrapper = hover ? motion.div : 'div'
  const wrapperProps = hover
    ? {
        whileHover: { y: -2, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)' },
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }
    : {}

  return (
    <Wrapper
      className={`rounded-3xl border border-border bg-surface shadow-card ${className}`}
      {...wrapperProps}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border-light px-6 py-5">
          <div>
            {title && (
              <h3 className="text-base font-bold text-dark">{title}</h3>
            )}
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </Wrapper>
  )
}
