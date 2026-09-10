import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import ToastProvider from './components/ui/ToastProvider'
import AppLayout from './layouts/AppLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import MemberNew from './pages/MemberNew'
import MemberDetail from './pages/MemberDetail'
import GroupsPage from './pages/GroupsPage'
import FarmsPage from './pages/FarmsPage'
import CollectionsPage from './pages/CollectionsPage'
import PaymentsPage from './pages/PaymentsPage'
import ExpensesPage from './pages/ExpensesPage'
import LoansPage from './pages/LoansPage'
import LoanDetailPage from './pages/LoanDetailPage'
import VisitsPage from './pages/VisitsPage'
import FieldDashboard from './pages/FieldDashboard'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'
import AuditLogsPage from './pages/AuditLogsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/members"
              element={
                <ProtectedRoute roles={['admin', 'manager', 'fieldOfficer']}>
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route path="/members/new" element={<MemberNew />} />
            <Route path="/members/:id/edit" element={<MemberNew />} />
            <Route path="/members/:id" element={<MemberDetail />} />
            <Route
              path="/groups"
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <GroupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farms"
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <FarmsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/new" element={<CollectionsPage autoOpen />} />
            <Route
              path="/payments"
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <ExpensesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans"
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <LoansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/:id"
              element={
                <ProtectedRoute roles={['admin', 'manager', 'fieldOfficer']}>
                  <LoanDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="/visits" element={<VisitsPage />} />
            <Route
              path="/field"
              element={
                <ProtectedRoute roles={['admin', 'manager', 'fieldOfficer']}>
                  <FieldDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={['admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
