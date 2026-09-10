import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { TrendingUp, Wallet, Users } from 'lucide-react'
import api from '../../services/api'
import Card from '../ui/Card'
import { formatCurrency } from '../../utils/format'

const PALETTE = {
  primary: '#0F766E',
  secondary: '#2563EB',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0891B2',
  muted: '#94A3B8',
}

const PIE_COLORS = [
  '#0F766E',
  '#2563EB',
  '#D97706',
  '#059669',
  '#0891B2',
  '#DC2626',
  '#7C3AED',
  '#64748B',
]

const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  fontSize: 13,
}

export default function DashboardCharts() {
  const [trendDays, setTrendDays] = useState(30)
  const [trend, setTrend] = useState([])
  const [breakdown, setBreakdown] = useState(null)
  const [breakdownView, setBreakdownView] = useState('status')
  const [growth, setGrowth] = useState([])
  const [trendLoading, setTrendLoading] = useState(true)
  const [breakdownLoading, setBreakdownLoading] = useState(true)
  const [growthLoading, setGrowthLoading] = useState(true)

  useEffect(() => {
    let active = true
    api
      .get('/dashboard/collection-trend', { params: { days: trendDays } })
      .then(({ data }) => {
        if (active)
          setTrend(data.data.map((p) => ({ date: p._id, total: p.total })))
      })
      .catch(() => {})
      .finally(() => active && setTrendLoading(false))
    return () => {
      active = false
    }
  }, [trendDays])

  useEffect(() => {
    let active = true
    api
      .get('/dashboard/payment-breakdown')
      .then(({ data }) => {
        if (active) setBreakdown(data.data)
      })
      .catch(() => {})
      .finally(() => active && setBreakdownLoading(false))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    api
      .get('/dashboard/member-growth')
      .then(({ data }) => {
        if (active) setGrowth(data.data)
      })
      .catch(() => {})
      .finally(() => active && setGrowthLoading(false))
    return () => {
      active = false
    }
  }, [])

  const breakdownData =
    breakdownView === 'status' ? (breakdown?.byStatus || []) : (breakdown?.byMethod || [])

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Collection Trend"
          subtitle={`Harvest volume over the last ${trendDays} days`}
          className="lg:col-span-2"
          icon={<TrendingUp className="h-5 w-5" />}
          actions={
            <div className="flex gap-1 rounded-xl bg-subtle/60 p-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setTrendLoading(true)
                    setTrendDays(d)
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    trendDays === d
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-muted hover:text-dark'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          }
        >
          <div className="-mx-6 -mb-6">
            {trendLoading ? (
              <div className="h-64 animate-pulse-soft bg-subtle/40" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trend} margin={{ top: 14, left: 0, right: 12, bottom: 4 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PALETTE.primary} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={PALETTE.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}kg`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${value} kg`, 'Harvest']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={PALETTE.primary}
                    strokeWidth={2.5}
                    fill="url(#trendFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card
          title="Payment Breakdown"
          subtitle={breakdownView === 'status' ? 'By status' : 'By method'}
          icon={<Wallet className="h-5 w-5" />}
          actions={
            <div className="flex gap-1 rounded-xl bg-subtle/60 p-1">
              {[
                { key: 'status', label: 'Status' },
                { key: 'method', label: 'Method' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setBreakdownView(t.key)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    breakdownView === t.key
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-muted hover:text-dark'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="-mx-6 -mb-6 flex flex-col items-center justify-center py-2">
            {breakdownLoading ? (
              <div className="h-64 w-full animate-pulse-soft bg-subtle/40" />
            ) : breakdownData.length === 0 ? (
              <div className="py-24 text-center text-sm text-muted">No payments yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={breakdownData}
                    dataKey="total"
                    nameKey="_id"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    strokeWidth={2}
                    stroke="#FFFFFF"
                  >
                    {breakdownData.map((entry, i) => (
                      <Cell key={entry._id} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value, _name) => [formatCurrency(value), 'Total']}
                    labelFormatter={() => ''}
                  />
                  <Legend
                    formatter={(label) => <span className="text-xs capitalize text-muted">{label}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card title="Member Growth" subtitle="Cumulative membership over time" icon={<Users className="h-5 w-5" />} className="mt-6">
        <div className="-mx-6 -mb-6">
          {growthLoading ? (
            <div className="h-64 animate-pulse-soft bg-subtle/40" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={growth} margin={{ top: 14, left: 0, right: 12, bottom: 4 }}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PALETTE.secondary} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={PALETTE.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value, _name) =>
                    _name === 'running'
                      ? [value, 'Total members']
                      : [value, 'Added this month']
                  }
                />
                <Area
                  type="monotone"
                  dataKey="running"
                  stroke={PALETTE.secondary}
                  strokeWidth={2.5}
                  fill="url(#growthFill)"
                />
                <Area
                  type="monotone"
                  dataKey="added"
                  stroke={PALETTE.success}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  )
}