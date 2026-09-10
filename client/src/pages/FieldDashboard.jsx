import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPinned,
  Users,
  ClipboardList,
  CheckCircle2,
  UserPlus,
  Plus,
  ArrowRight,
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import VisitModal from '../components/visits/VisitModal'
import TaskModal from '../components/visits/TaskModal'
import QuickRegisterModal from '../components/members/QuickRegisterModal'
import { formatDate } from '../utils/format'

export default function FieldDashboard() {
  const { user, hasRole } = useAuth()
  const isOfficer = user?.role === 'fieldOfficer'
  const isLeader = hasRole('admin') || hasRole('manager')

  const [members, setMembers] = useState([])
  const [visits, setVisits] = useState([])
  const [tasks, setTasks] = useState([])
  const [performance, setPerformance] = useState([])
  const [loading, setLoading] = useState(true)

  const [visitOpen, setVisitOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (isOfficer) {
        const [membersRes, tasksRes, visitsRes] = await Promise.all([
          api.get('/visits/me/members'),
          api.get('/visits/me/tasks'),
          api.get('/visits'),
        ])
        setMembers(membersRes.data.data || [])
        setTasks(tasksRes.data.data || [])
        setVisits(visitsRes.data.data || [])
      } else {
        const [perfRes, visitsRes] = await Promise.all([
          api.get('/visits/performance?days=30'),
          api.get('/visits'),
        ])
        setPerformance(perfRes.data.data || [])
        setVisits(visitsRes.data.data || [])
      }
    } catch {
      // individual sections stay empty on error
    } finally {
      setLoading(false)
    }
  }, [isOfficer])

  useEffect(() => {
    load()
  }, [load])

  const setTaskStatus = async (task, status) => {
    try {
      await api.put(`/visits/tasks/${task._id}`, { status })
      setTasks((ts) => ts.map((t) => (t._id === task._id ? { ...t, status } : t)))
    } catch {
      // status unchanged on failure
    }
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthVisits = visits.filter((v) => new Date(v.date) >= startOfMonth).length
  const openTasks = tasks.filter((t) => ['pending', 'in_progress'].includes(t.status)).length
  const doneTasks = tasks.filter((t) => t.status === 'completed').length

  const officerStats = [
    { label: 'Assigned members', value: members.length, icon: Users, accent: 'primary' },
    { label: 'Visits this month', value: monthVisits, icon: MapPinned, accent: 'success' },
    { label: 'Tasks open', value: openTasks, icon: ClipboardList, accent: 'warning' },
    { label: 'Tasks completed', value: doneTasks, icon: CheckCircle2, accent: 'info' },
  ]

  return (
    <div>
      <PageHeader
        title={isOfficer ? 'My Field Area' : 'Field Operations'}
        subtitle={
          isOfficer
            ? 'Your assigned members, visits and tasks'
            : 'Officer performance and field activity'
        }
        action={
          <div className="flex flex-wrap gap-2">
            {isLeader && (
              <>
                <Button variant="outline" size="sm" onClick={() => setTaskOpen(true)}>
                  <Plus className="h-4 w-4" /> Assign Task
                </Button>
                <Button size="sm" onClick={() => setRegisterOpen(true)}>
                  <UserPlus className="h-4 w-4" /> Quick Register
                </Button>
              </>
            )}
            <Button size="sm" onClick={() => setVisitOpen(true)}>
              <MapPinned className="h-4 w-4" /> Record Visit
            </Button>
          </div>
        }
      />

      {/* Stats */}
      {isOfficer && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {officerStats.map((s) => (
            <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} accent={s.accent} />
          ))}
        </div>
      )}
      {isLeader && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Active officers" value={performance.length} accent="primary" />
          <StatCard icon={MapPinned} label="Total visits (30d)" value={visits.length} accent="success" />
          <StatCard icon={ClipboardList} label="Visits this month" value={monthVisits} accent="warning" />
          <StatCard icon={UserPlus} label="Officer workloads assignable" value={performance.length} accent="info" />
        </div>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse-soft rounded-xl bg-subtle" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Tasks (officer) or Performance (leader) */}
          <div className="lg:col-span-1">
            {isOfficer ? (
              <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-dark">My Tasks</h3>
                  <span className="rounded-full bg-subtle px-2.5 py-1 text-xs font-semibold text-muted">
                    {tasks.length}
                  </span>
                </div>
                {tasks.length === 0 ? (
                  <EmptyState
                    compact
                    title="No tasks"
                    description="Tasks assigned to you appear here."
                  />
                ) : (
                  <div className="space-y-2">
                    {tasks.map((t) => (
                      <div key={t._id} className="rounded-2xl border border-border-light p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-dark">{t.title}</p>
                          <Badge status={t.status} />
                        </div>
                        {t.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted">{t.description}</p>
                        )}
                        {t.memberId && (
                          <p className="mt-1 text-xs font-medium text-primary">
                            {t.memberId.firstName} {t.memberId.lastName}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border-light pt-2">
                          <span className="text-xs text-muted">
                            {t.dueDate ? `Due ${formatDate(t.dueDate)}` : 'No due date'}
                          </span>
                          {t.status !== 'completed' && t.status !== 'cancelled' ? (
                            <button
                              onClick={() => setTaskStatus(t, 'completed')}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-success hover:text-success-700"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Mark done
                            </button>
                          ) : (
                            <span className="text-xs text-muted">{formatDate(t.updatedAt)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-dark">Officer Performance</h3>
                  <span className="rounded-full bg-subtle px-2.5 py-1 text-xs font-semibold text-muted">30d</span>
                </div>
                {performance.length === 0 ? (
                  <EmptyState
                    compact
                    title="No activity yet"
                    description="Officer visit totals for the last 30 days."
                  />
                ) : (
                  <div className="space-y-2">
                    {performance.map((p) => (
                      <div key={p._id} className="flex items-center gap-3 rounded-2xl border border-border-light p-3">
                        <Avatar name={p.name} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-dark">{p.name}</p>
                          <p className="text-xs capitalize text-muted">{p.role}</p>
                        </div>
                        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary">
                          {p.visits} visits
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Members (officer) / Visits (leader) */}
          <div className="lg:col-span-2">
            {isOfficer ? (
              <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-dark">Assigned Members</h3>
                  <Link to="/members" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover">
                    All members <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {members.length === 0 ? (
                  <EmptyState
                    compact
                    title="No members assigned"
                    description="When members are assigned to you they appear here."
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {members.map((m) => (
                      <Link
                        key={m._id}
                        to={`/members/${m._id}`}
                        className="flex items-center gap-3 rounded-2xl border border-border-light p-3 transition-colors hover:border-primary-200 hover:bg-primary-50/40"
                      >
                        <Avatar name={`${m.firstName} ${m.lastName}`} src={m.photo} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-dark">
                            {m.firstName} {m.lastName}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {m.groupId?.name || m.location || m.region || '—'}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-muted">
                          {m.membershipNumber || m.phone}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-dark">Recent Field Visits</h3>
                  <Link to="/visits" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {visits.length === 0 ? (
                  <EmptyState compact title="No visits recorded" description="Field activity will appear here." />
                ) : (
                  <div className="divide-y divide-border-light">
                    {visits.slice(0, 6).map((v) => (
                      <div key={v._id} className="flex items-center gap-3 py-3">
                        <Avatar
                          name={v.memberId ? `${v.memberId.firstName} ${v.memberId.lastName}` : '?'}
                          src={v.memberId?.photo}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-dark">
                            {v.memberId ? `${v.memberId.firstName} ${v.memberId.lastName}` : 'Unknown member'}
                          </p>
                          <p className="truncate text-xs text-muted">{v.purpose || v.officerId?.name || 'Field visit'}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-medium text-muted">{formatDate(v.date)}</p>
                          <span className="text-[11px] capitalize text-muted-light">{v.officerId?.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <VisitModal open={visitOpen} onClose={() => setVisitOpen(false)} onSaved={load} />
      {isLeader && (
        <>
          <TaskModal open={taskOpen} onClose={() => setTaskOpen(false)} onSaved={load} />
          <QuickRegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} onSaved={load} />
        </>
      )}
    </div>
  )
}