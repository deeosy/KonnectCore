import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Layers,
  Package,
  Wallet,
  AlertCircle,
  HandCoins,
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatCurrency, formatNumber, formatDateTime } from '../utils/format'

function StatCard({ icon: Icon, label, value, sub, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600',
    navy: 'bg-navy-900 text-white',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="rounded-xl border border-navy-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${accents[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="mt-1 text-sm text-navy-500">{label}</p>
      {sub && <p className="mt-2 text-xs font-medium text-brand-600">{sub}</p>}
    </div>
  )
}

const activityStyles = {
  member: 'bg-brand-500',
  collection: 'bg-green-500',
  payment: 'bg-amber-500',
  visit: 'bg-blue-500',
}

export default function Dashboard() {
  const { user, hasRole } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity'),
        ])
        setStats(statsRes.data.data)
        setActivity(activityRes.data.data)
      } catch (error) {
        console.error('Failed to load dashboard', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-navy-100" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Here's what's happening in your cooperative"
        action={
          hasRole('fieldOfficer') ? (
            <Button onClick={() => navigate('/collections/new')}>Record Collection</Button>
          ) : (
            <Button onClick={() => navigate('/members/new')}>Add Member</Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Users} label="Total Members" value={formatNumber(stats?.totalMembers)} accent="navy" />
        <StatCard icon={UserCheck} label="Active Members" value={formatNumber(stats?.activeMembers)} accent="green" />
        <StatCard icon={Layers} label="Groups" value={formatNumber(stats?.totalGroups)} accent="blue" />
        <StatCard icon={Package} label="Collections" value={formatNumber(stats?.totalCollections)} sub={`${formatNumber(stats?.totalCollectionsWeight)} kg`} accent="brand" />
        <StatCard icon={Wallet} label="Payments Paid" value={formatCurrency(stats?.totalPaymentsPaid)} accent="green" />
        <StatCard icon={AlertCircle} label="Outstanding Dues" value={formatCurrency(stats?.outstandingDues)} accent="red" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Recent Activity" className="lg:col-span-2">
          <div className="-mx-5 -mb-5">
            {activity.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-navy-400">
                No recent activity yet
              </div>
            ) : (
              <ul className="divide-y divide-navy-100">
                {activity.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${activityStyles[item.type] || 'bg-navy-300'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy-900">{item.label}</p>
                      <p className="truncate text-xs text-navy-400">{item.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-navy-400">
                      {formatDateTime(item.date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="-mx-5 -mb-5 grid gap-1 p-2">
            {[
              { label: 'View Members', path: '/members', icon: Users, show: true },
              { label: 'Manage Groups', path: '/groups', icon: Layers, show: hasRole('admin', 'manager') },
              { label: 'Record Payments', path: '/payments', icon: Wallet, show: hasRole('admin', 'manager') },
              { label: 'Manage Loans', path: '/loans', icon: HandCoins, show: hasRole('admin', 'manager') },
            ]
              .filter((a) => a.show)
              .map((a) => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-navy-700 transition-colors hover:bg-brand-50"
                >
                  <a.icon className="h-5 w-5 text-brand-600" />
                  {a.label}
                </button>
              ))}
          </div>
        </Card>
      </div>
    </div>
  )
}