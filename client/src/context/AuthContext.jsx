import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.data)
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Restore cached user immediately, then validate via /me
    const cached = localStorage.getItem('user')
    if (cached) {
      try {
        setUser(JSON.parse(cached))
      } catch (error) {
        /* ignore */
      }
    }
    loadMe()
  }, [loadMe])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    const userData = data.data
    localStorage.setItem('token', userData.token)
    delete userData.token
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const hasRole = (...roles) => {
    return user && roles.includes(user.role)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAdmin: hasRole('admin'),
    isManager: hasRole('admin', 'manager'),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}