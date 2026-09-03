import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import ToastProvider from './components/ui/ToastProvider'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'
import Members from './pages/Members'
import MemberNew from './pages/MemberNew'
import MemberDetail from './pages/MemberDetail'
import GroupsPage from './pages/GroupsPage'
import CollectionsPage from './pages/CollectionsPage'
import PaymentsPage from './pages/PaymentsPage'
import LoansPage from './pages/LoansPage'
import VisitsPage from './pages/VisitsPage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Routes>
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
                  <ComingSoon title="Farms & Crops" subtitle="Record farm and crop profiles for members" />
                </ProtectedRoute>
              }
            />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route
              path="/payments"
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <PaymentsPage />
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
            <Route path="/visits" element={<VisitsPage />} />
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
