import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "../components/FullScreenLoader";

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Auth state is restored from localStorage immediately (see AuthContext),
  // so loading only lasts for the /auth/me validation round-trip.
  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    // Pass along the attempted path so Login can redirect the user back after
    // a successful sign-in instead of dropping them on the dashboard.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-gated routes redirect unauthorized users to the dashboard rather
  // than showing an error page.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
