// Top-level authenticated layout: collapsible sidebar, topbar with profile
// dropdown and a global member-search popover, and an <Outlet /> for nested
// route content.
import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, ChevronDown, Bell, Search } from 'lucide-react'
import logo from '../assets/images/preferedlogo2.png'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { navSections } from '../config/navigation'
import Avatar from '../components/ui/Avatar'
import Input from '../components/ui/Input'
import api from '../services/api'

// Debounce a value by a delay (ms) so keystrokes don't fire one API request
// per character — the topbar global search waits 350ms of quiet typing.
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function AppLayout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  // Global search popover state: query, live results, and loading flag.
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  // Notifications dropdown (placeholder — there is no notification engine yet).
  const [notificationOpen, setNotificationOpen] = useState(false)
  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350)

  // Live member search: fetch up to 5 matches for the debounced query. The
  // `active` flag discards stale responses if the user keeps typing. When the
  // query is empty the effect does nothing — the render short-circuits on
  // searchQuery, so no state needs clearing here.
  useEffect(() => {
    if (!debouncedQuery) return
    let active = true
    setSearching(true)
    api
      .get(`/members?search=${encodeURIComponent(debouncedQuery)}&limit=5`)
      .then(({ data }) => {
        if (active) setSearchResults(data.data || [])
      })
      .catch(() => {
        if (active) setSearchResults([])
      })
      .finally(() => {
        if (active) setSearching(false)
      })
    return () => {
      active = false
    }
  }, [debouncedQuery])

  // Navigate to a matched member and reset the popover so it starts fresh next time.
  const goToMember = (id) => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
    navigate(`/members/${id}`)
  }

  // Filter the nav sections by the user's role, dropping any section whose
  // items are all hidden so empty groups never render.
  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasRole(...item.roles)),
    }))
    .filter((section) => section.items.length > 0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-dark">
      {/* Logo */}
      <div className={`flex h-16 shrink-0 items-center ${collapsed ? 'justify-center' : 'justify-between'} border-b border-dark-light px-5`}>
        <Link to="/dashboard" className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-2'} min-w-0`}>
          <img
            src={logo}
            alt="KonnectCore"
            className={`h-auto w-auto max-h-9 object-contain transition-all ${collapsed ? 'max-w-9' : 'max-w-[140px]'}`}
          />
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 text-muted-light transition-colors hover:bg-dark-light hover:text-white lg:flex"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${collapsed ? '-rotate-90' : 'rotate-90'}`} />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-light transition-colors hover:bg-dark-light hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleSections.map((section) => (
          <div key={section.title} className="mb-5">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-light/60">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-primary/15 text-primary-light'
                        : 'text-muted-light hover:bg-dark-light hover:text-white'
                    }`
                  }
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-dark-light p-3">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-light transition-colors hover:bg-dark-light hover:text-white ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden shrink-0 lg:block"
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar overlay: only mounted while open so the slide-in
          animation plays on toggling, and clicking the backdrop closes it */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="absolute left-0 top-0 h-full w-64"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-muted transition-colors hover:bg-subtle hover:text-dark lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:block">
              <span className="text-sm text-muted">
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global member search: opens a dropdown that live-queries
                /members as the user types and jumps to a profile on click */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="rounded-xl p-2.5 text-muted transition-colors hover:bg-subtle hover:text-dark"
                aria-label="Search members"
              >
                <Search className="h-4.5 w-4.5" />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <>
                    {/* Invisible backdrop closes the popover on outside click */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setSearchOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
                    >
                      <div className="border-b border-border-light p-3">
                        <Input
                          autoFocus
                          icon={Search}
                          placeholder="Search members..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="max-h-80 overflow-y-auto p-2">
                        {searchQuery.trim() === '' ? (
                          <p className="px-3 py-2 text-xs text-muted">
                            Search members by name, phone, or membership ID.
                          </p>
                        ) : searching ? (
                          <p className="px-3 py-2 text-xs text-muted">Searching…</p>
                        ) : searchResults.length === 0 ? (
                          <p className="px-3 py-2 text-xs text-muted">
                            No members match “{searchQuery.trim()}”.
                          </p>
                        ) : (
                          searchResults.map((m) => (
                            <button
                              key={m._id}
                              onClick={() => goToMember(m._id)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-subtle"
                            >
                              <Avatar
                                name={`${m.firstName} ${m.lastName}`}
                                src={m.photo}
                                size="sm"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-dark">
                                  {m.firstName} {m.lastName}
                                </span>
                                <span className="block truncate text-xs text-muted">
                                  {m.membershipNumber || m.phone || m.location}
                                </span>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications: placeholder panel. The red unread dot was removed
                because no notification engine exists yet — a fake unread badge
                would be misleading until Phase 16 (communication) arrives */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen((v) => !v)}
                className="rounded-xl p-2.5 text-muted transition-colors hover:bg-subtle hover:text-dark"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
              </button>

              <AnimatePresence>
                {notificationOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setNotificationOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
                    >
                      <p className="border-b border-border-light px-4 py-3 text-sm font-bold text-dark">
                        Notifications
                      </p>
                      <p className="px-4 py-6 text-center text-xs text-muted">
                        No new notifications yet.
                      </p>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile dropdown with user info and logout; toggled by the
                chevron button below and closed via the invisible backdrop */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-subtle"
              >
                <Avatar name={user?.name} size="sm" />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-dark leading-tight">{user?.name}</p>
                  <p className="text-xs capitalize text-muted">{user?.role}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
                    >
                      <div className="border-b border-border-light px-4 py-3">
                        <p className="text-sm font-bold text-dark">{user?.name}</p>
                        <p className="text-xs text-muted">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
