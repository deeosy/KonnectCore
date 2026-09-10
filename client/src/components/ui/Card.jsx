import { motion } from 'framer-motion'

export default function Card({ children, className = '', title, subtitle, icon, action, actions, hover = false, ...props }) {
  const actionsList = actions ? (Array.isArray(actions) ? actions : [actions]) : []
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
      {(title || action || actionsList.length > 0) && (
        <div className="flex items-center justify-between gap-4 border-b border-border-light px-6 py-5">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-bold text-dark">{title}</h3>
              )}
              {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {action}
            {actionsList.map((a, i) => (
              <span key={i}>{a}</span>
            ))}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </Wrapper>
  )
}
