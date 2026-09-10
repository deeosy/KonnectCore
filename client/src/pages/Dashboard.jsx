import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  Layers,
  PackageCheck,
  Wallet,
  AlertCircle,
  HandCoins,
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import DashboardCharts from '../components/dashboard/DashboardCharts'
import { formatCurrency, formatNumber, formatDateTime } from '../utils/format'

const activityStyles = {
  member: 'bg-primary',
  collection: 'bg-success',
  payment: 'bg-warning',
  visit: 'bg-secondary',
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
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
      <div>
        <PageHeader title="Dashboard" subtitle="Loading your data..." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse-soft rounded-3xl bg-subtle" />
          ))}
        </div>
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

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        <motion.div variants={staggerItem}>
          <StatCard icon={Users} label="Total Members" value={formatNumber(stats?.totalMembers)} accent="dark" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard icon={UserCheck} label="Active Members" value={formatNumber(stats?.activeMembers)} accent="success" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard icon={Layers} label="Groups" value={formatNumber(stats?.totalGroups)} accent="info" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            icon={PackageCheck}
            label="Collections"
            value={formatNumber(stats?.totalCollections)}
            sub={`${formatNumber(stats?.totalCollectionsWeight)} kg`}
            accent="primary"
            inline
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard icon={Wallet} label="Payments Paid" value={formatCurrency(stats?.totalPaymentsPaid)} accent="success" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard icon={AlertCircle} label="Outstanding Dues" value={formatCurrency(stats?.outstandingDues)} accent="danger" />
        </motion.div>
      </motion.div>

      <div className="mt-8">
        <DashboardCharts />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card title="Recent Activity" className="lg:col-span-2">
          <div className="-mx-6 -mb-6">
            {activity.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted">
                No recent activity yet
              </div>
            ) : (
              <ul className="divide-y divide-border-light">
                {activity.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-subtle/30"
                  >
                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${activityStyles[item.type] || 'bg-muted-light'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-dark">{item.label}</p>
                      <p className="truncate text-xs text-muted">{item.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      {formatDateTime(item.date)}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="-mx-6 -mb-6 grid gap-0.5 p-2">
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
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-dark transition-colors hover:bg-primary-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50">
                    <a.icon className="h-4 w-4 text-primary" />
                  </div>
                  {a.label}
                </button>
              ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
