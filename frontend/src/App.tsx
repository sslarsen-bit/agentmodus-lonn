import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { getMe } from './api/auth'

// Auth
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'

// User pages
import { CalendarPage } from './pages/CalendarPage'
import { TimerPage } from './pages/TimerPage'
import { ShiftCodesPage } from './pages/ShiftCodesPage'
import { CalculatorPage } from './pages/CalculatorPage'
import { ProfilePage } from './pages/ProfilePage'
import { ImportPage } from './pages/ImportPage'
import { ExportPage } from './pages/ExportPage'

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminUsers } from './pages/admin/AdminUsers'

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.is_admin) return <Navigate to="/admin" replace />
  return <>{children}</>
}

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.is_admin) return <Navigate to="/calendar" replace />
  return <>{children}</>
}

function App() {
  const { token, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      getMe().then(setUser).catch(() => {}).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User app */}
        <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
        <Route path="/timer" element={<RequireAuth><TimerPage /></RequireAuth>} />
        <Route path="/shift-codes" element={<RequireAuth><ShiftCodesPage /></RequireAuth>} />
        <Route path="/calculator" element={<RequireAuth><CalculatorPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/import" element={<RequireAuth><ImportPage /></RequireAuth>} />
        <Route path="/export" element={<RequireAuth><ExportPage /></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="*" element={<Navigate to="/calendar" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
