import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

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
      <div className="hidden flex-1 bg-navy-900 lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">KonnectCore</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Manage your agricultural cooperative
            </h2>
            <p className="mt-3 max-w-md text-navy-300">
              Members, crops, harvests, payments and loans - all in one platform built
              for Ghanaian farmer organisations.
            </p>
            <div className="mt-8 space-y-3">
              {['Member & farm management', 'Produce collection & payments', 'Group hierarchy & reports'].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-brand-400" />
                  <span className="text-sm text-navy-200">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-navy-500">© {new Date().getFullYear()} KonnectCore</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-navy-50 p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-navy-900">KonnectCore</span>
          </div>

          <div className="rounded-2xl border border-navy-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-navy-900">Sign in</h1>
            <p className="mt-1 text-sm text-navy-500">
              Access your organisation dashboard
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organisation.com"
                required
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-navy-400">
              Demo: admin@konnectcore.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}