import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/images/preferedlogo2.png'

const features = [
  'Member & farm management',
  'Produce collection & payments',
  'Group hierarchy & reports',
]

const stats = [
  { value: '12,400+', label: 'Farmers' },
  { value: '₵4.6M', label: 'Disbursed' },
]

const IMG =
  'https://images.pexels.com/photos/11196880/pexels-photo-11196880.jpeg?auto=compress&cs=tinysrgb&h=900&w=700'

const spring = { type: 'spring', stiffness: 260, damping: 20 }

const wordReveal = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const wordChild = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 200, damping: 14 },
  },
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ═══════════════ LEFT PANEL ═══════════════ */}
      <div className="hidden lg:flex w-[48%] xl:w-[52%] flex-col justify-between relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={IMG}
            alt="Farmers working in the field"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Dark overlay + gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-teal-900/55 to-dark/80" />

        {/* Static glow orbs */}
        <div className="absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute top-1/4 -right-20 h-80 w-80 rounded-full bg-primary-light/10 blur-[80px]" />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col justify-between h-full p-8 md:p-12 xl:p-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            <img
              src={logo}
              alt="KonnectCore"
              className="h-auto max-h-12 md:max-h-14 xl:max-h-16 w-auto max-w-[150px] md:max-w-[170px] xl:max-w-[200px] object-contain drop-shadow-2xl"
            />
          </motion.div>

          {/* Center content — glass card */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.25 }}
            style={{ perspective: 1000 }}
          >
            {/* Glass card */}
            <div className="relative p-[1px] rounded-[2rem] overflow-hidden">
              <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(20,184,166,0.4)_12%,transparent_24%,rgba(94,234,212,0.3)_36%,transparent_48%,rgba(20,184,166,0.4)_60%,transparent_72%)]" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="relative rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 p-7 md:p-9 xl:p-11"
              >
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.5 }}
                  className="text-[10px] md:text-xs font-bold text-teal-300 uppercase tracking-[0.25em] mb-4"
                >
                  Cooperative platform
                </motion.p>

                {/* Word-by-word headline */}
                <motion.h1
                  variants={wordReveal}
                  initial="hidden"
                  animate="visible"
                  className="text-3xl md:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.05]"
                >
                  {'Empowering'.split(' ').map((word) => (
                    <motion.span key={word} variants={wordChild} className="inline-block mr-[0.3em]">
                      {word}
                    </motion.span>
                  ))}
                  <br />
                  <motion.span
                    variants={wordChild}
                    className="inline-block bg-gradient-to-r from-teal-200 via-teal-300 to-teal-400 bg-clip-text text-transparent"
                  >
                    farmers.
                  </motion.span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-5 text-teal-50/75 text-xs md:text-sm xl:text-base leading-relaxed max-w-md"
                >
                  Everything your cooperative needs — members, crops, payments, and loans.
                </motion.p>

                {/* Features */}
                <div className="mt-7 space-y-3">
                  {features.map((f, i) => (
                    <motion.div
                      key={f}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.7 + i * 0.12 }}
                      className="flex items-center gap-3"
                    >
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-teal-300 to-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                        <Check className="h-3.5 w-3.5 text-teal-900" strokeWidth={3} />
                      </div>
                      <span className="text-xs md:text-sm xl:text-[15px] font-medium text-white/85">{f}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Floating stat chips */}
            <div className="absolute -right-3 top-8 md:-right-5 md:top-10">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 1 + i * 0.15 }}
                  className="mb-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 px-4 py-2.5 shadow-xl"
                >
                  <p className="text-base md:text-lg font-extrabold text-white leading-none">{s.value}</p>
                  <p className="text-[10px] text-teal-300/80 uppercase tracking-wider mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-[10px] md:text-xs text-teal-100/30"
          >
            © {new Date().getFullYear()} KonnectCore. All rights reserved.
          </motion.p>
        </div>
      </div>

      {/* ═══════════════ RIGHT PANEL ═══════════════ */}
      <div className="flex flex-1 items-center justify-center bg-background px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:px-12 lg:py-8 xl:px-16 xl:py-12 2xl:px-20 relative overflow-hidden">
        {/* Subtle decorative orb on right panel */}
        <div className="absolute top-20 -right-32 h-96 w-96 rounded-full bg-primary/[0.03] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/[0.02] blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[340px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[400px] xl:max-w-[440px] 2xl:max-w-[480px] relative z-10"
        >
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.1 }}
            className="lg:hidden mb-6 sm:mb-8 md:mb-10"
          >
            <img
              src={logo}
              alt="KonnectCore"
              className="h-auto max-h-8 sm:max-h-10 md:max-h-12 w-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px] object-contain"
            />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.2 }}
            className="mb-8 sm:mb-10 md:mb-12"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '1.5rem' }}
              transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
              className="h-1 rounded-full bg-gradient-to-r from-primary to-primary-light mb-3"
            />
            <p className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Cooperative dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] xl:text-5xl font-extrabold tracking-tight text-dark leading-tight">
              {'Welcome'.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.3 + i * 0.06 }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.5 }}
                className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent"
              >
                back.
              </motion.span>
            </h1>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 md:space-y-7">
            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.45 }}
            >
              <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-dark mb-2 sm:mb-2.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@organisation.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="peer w-full px-0 py-3 sm:py-3.5 md:py-4 bg-transparent text-sm sm:text-[15px] md:text-base text-dark placeholder-muted-light/60 outline-none focus-visible:outline-none focus:outline-none focus:ring-0 border-none"
                />
                <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-border/40 rounded-full" />
                <div className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-gradient-to-r from-primary via-primary-light to-secondary rounded-full transition-all duration-500 ease-out peer-focus:w-full" />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.55 }}
            >
              <div className="flex justify-between items-center mb-2 sm:mb-2.5">
                <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-dark uppercase tracking-wider">
                  Password
                </label>
                <motion.a
                  href="#"
                  whileHover={{ x: 2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="text-[11px] sm:text-xs md:text-sm text-primary-hover hover:text-primary transition-colors duration-200 font-medium"
                >
                  Reset
                </motion.a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="peer w-full px-0 py-3 sm:py-3.5 md:py-4 bg-transparent text-sm sm:text-[15px] md:text-base text-dark placeholder-muted-light/60 outline-none focus-visible:outline-none focus:outline-none focus:ring-0 border-none"
                />
                <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-border/40 rounded-full" />
                <div className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-gradient-to-r from-primary via-primary-light to-secondary rounded-full transition-all duration-500 ease-out peer-focus:w-full" />
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.65 }}
              className="pt-2 sm:pt-3"
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.01, boxShadow: '0 12px 40px -6px rgba(15,118,110,0.45)' }}
                whileTap={loading ? {} : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="group relative w-full py-3.5 sm:py-4 md:py-[18px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-dark via-dark-light to-dark text-white font-bold text-sm sm:text-[15px] md:text-base uppercase tracking-widest overflow-hidden disabled:opacity-60 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {/* Animated gradient sweep on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-hover via-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Shimmer line */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <span className="relative z-10 flex items-center gap-2.5">
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 md:h-5 md:w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>

          {/* Demo credentials */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.8 }}
            className="mt-8 sm:mt-10 md:mt-12 pt-5 sm:pt-6 border-t border-border/60"
          >
            <div className="rounded-xl bg-subtle/50 border border-border-light/50 px-4 py-3">
              <p className="text-[11px] sm:text-xs text-muted">Demo credentials</p>
              <p className="text-[11px] sm:text-xs font-semibold text-dark mt-1">
                admin@konnectcore.com / admin123
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
