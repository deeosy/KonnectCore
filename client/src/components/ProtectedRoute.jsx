import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FullScreenLoader from '../components/FullScreenLoader'

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <FullScreenLoader />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}