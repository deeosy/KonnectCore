import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Restore the cached user JSON so the UI can render immediately on page
    // reload without waiting for a network round-trip, then validate the
    // token against /auth/me. If the token is stale or the account was
    // deactivated, loadMe clears the cache and the app falls back to logged-out.
    const cached = localStorage.getItem("user");
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch (error) {
        /* ignore */
      }
    }
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const userData = data.data;
    // Persist the token for the request interceptor, but strip it from the
    // cached user object before storing — the token is redundant in the user
    // profile and keeping a second copy in localStorage increases the
    // exposure surface if the storage is compromised.
    localStorage.setItem("token", userData.token);
    delete userData.token;
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Role check used for UI gating (navigation, buttons). This is a client-side
  // convenience only — the server re-validates every request via authorize(),
  // so a tampered client cannot escalate privileges.
  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAdmin: hasRole("admin"),
    isManager: hasRole("admin", "manager"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
