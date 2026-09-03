import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sprout, Mail, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const features = [
  'Member & farm management',
  'Produce collection & payments',
  'Group hierarchy & reports',
]

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
      <div className="hidden flex-1 bg-dark lg:flex">
        <div className="flex h-full w-full flex-col justify-between p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">KonnectCore</span>
          </motion.div>

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
              Manage your agricultural cooperative
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-light">
              Members, crops, harvests, payments and loans — all in one platform built
              for Ghanaian farmer organisations.
            </p>
            <div className="mt-8 space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                    <ArrowRight className="h-3 w-3 text-primary-light" />
                  </div>
                  <span className="text-sm text-muted-light">{f}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <p className="text-xs text-muted-light/50">
            © {new Date().getFullYear()} KonnectCore. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-dark">KonnectCore</span>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
            <div className="mb-2">
              <h1 className="text-2xl font-bold tracking-tight text-dark">Welcome back</h1>
              <p className="mt-1 text-sm text-muted">
                Sign in to your organisation dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 rounded-xl bg-subtle/50 px-4 py-3 text-center">
              <p className="text-xs text-muted">
                Demo credentials: <span className="font-semibold text-dark">admin@konnectcore.com</span> / <span className="font-semibold text-dark">admin123</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
