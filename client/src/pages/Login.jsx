import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight, ArrowUpRight } from 'lucide-react'
import logo from '../assets/images/preferedlogo2.png'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const features = [
  'Member & farm management',
  'Produce collection & payments',
  'Group hierarchy & reports',
]

const stats = [
  ['12,480', 'Members'],
  ['₵4.6M', 'Loan book'],
  ['100%', 'Reconciled'],
]

const LEFT_IMG =
  'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=640&h=520&q=80'

const EASE = [0.22, 1, 0.36, 1]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      {/* Left panel - Branding */}
      <div className="relative hidden flex-1 overflow-hidden bg-linear-to-br from-primary-500 via-primary-600 to-primary-800 lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]"
        />
        <motion.div
          animate={{ y: [0, -24, 0] }}
          transition={{ repeat: Infinity, duration: 16, ease: 'easeInOut' }}
          aria-hidden
          className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-white/15 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 18, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
          aria-hidden
          className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-warning-light/25 blur-3xl"
        />
        <div aria-hidden className="absolute -right-24 -bottom-28 h-96 w-96 rounded-full border border-white/15" />
        <div aria-hidden className="absolute top-0 left-0 h-28 w-28 border-t border-l border-white/20" />

        <div className="relative flex h-full w-full flex-col justify-between p-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <img
              src={logo}
              alt="KonnectCore"
              className="h-auto max-h-16 w-auto max-w-[180px] object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 font-mono text-xs text-white backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Live · Harvest 2026
            </span>

            <h2 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl">
              Grow the cooperative, <span className="text-warning-light">not the paperwork.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/80">
              Members, crops, harvests, payments and loans — all in one platform built
              for Ghanaian farmer organisations.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-5">
              <div className="space-y-2.5 sm:col-span-2">
                {features.map((f, i) => (
                  <motion.div
                    key={f}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 backdrop-blur"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <ArrowRight className="h-2.5 w-2.5 text-white" />
                    </span>
                    <span className="text-xs text-white/85">{f}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="relative sm:col-span-3"
              >
                <div className="relative h-40 overflow-hidden rounded-2xl border border-white/15 shadow-xl shadow-primary-900/30 sm:h-48">
                  <img
                    src={LEFT_IMG}
                    alt="Field officer using KonnectCore during harvest"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-primary-900/70 to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-warning-light px-3 py-1 font-mono text-[10px] font-bold text-primary-800 shadow-lg">
                    0 pending
                  </span>
                  <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-4 pb-3">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                    <span className="font-mono text-[11px] text-white/90">
                      Field officer check-in · Nkwanta
                    </span>
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="mt-6 grid grid-cols-3 gap-3"
            >
              {stats.map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur">
                  <div className="text-xl font-extrabold text-white">{v}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/70">{l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <p className="text-xs text-muted-light/50">
            © {new Date().getFullYear()} KonnectCore. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-background p-6">
        <div aria-hidden className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-warning/15 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center lg:hidden">
            <img
              src={logo}
              alt="KonnectCore"
              className="h-auto max-h-12 w-auto max-w-[160px] object-contain"
            />
          </div>

          {/* Card */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative overflow-hidden rounded-[2rem] border border-border bg-white p-8 shadow-2xl shadow-primary/5 sm:p-10"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary-500 via-primary-400 to-warning-light"
            />
            <motion.div variants={item}>
              <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
                Cooperative sign in
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-dark">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-muted">
                Sign in to your organisation dashboard
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <motion.div variants={item}>
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organisation.com"
                  icon={Mail}
                  required
                />
              </motion.div>
              <motion.div variants={item}>
                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={Lock}
                  required
                />
              </motion.div>

              <motion.div variants={item} className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  Forgot password?
                </a>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm font-medium text-danger"
                >
                  {error}
                </motion.div>
              )}

              <motion.div variants={item}>
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </motion.div>
            </form>

            <motion.div variants={item} className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary-50 px-4 py-3">
              <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold text-white">
                Demo
              </span>
              <p className="text-xs text-muted">
                <span className="font-semibold text-dark">admin@konnectcore.com</span> / <span className="font-semibold text-dark">admin123</span>
              </p>
            </motion.div>

            <motion.div variants={item} className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted">
              New cooperative?
              <a
                href="mailto:hello@konnectcore.com"
                className="inline-flex items-center gap-0.5 font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                Talk to us
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}