import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'

import Landing from './pages/Landing'
import UserLogin from './pages/UserLogin'
import UserRegister from './pages/UserRegister'
import PartnerLogin from './pages/PartnerLogin'
import PartnerRegister from './pages/PartnerRegister'
import Feed from './pages/Feed'
import Saved from './pages/Saved'
import PartnerDashboard from './pages/PartnerDashboard'
import PartnerProfile from './pages/PartnerProfile'

function HomeRedirect() {
  const { role } = useAuth()
  if (role === 'user') return <Navigate to="/feed" replace />
  if (role === 'partner') return <Navigate to="/partner/dashboard" replace />
  return <Landing />
}

function withShell(element) {
  return <AppShell>{element}</AppShell>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />

            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/partner/login" element={<PartnerLogin />} />
            <Route path="/partner/register" element={<PartnerRegister />} />

            <Route
              path="/feed"
              element={
                <ProtectedRoute role="user">{withShell(<Feed />)}</ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute role="user">{withShell(<Saved />)}</ProtectedRoute>
              }
            />
            <Route
              path="/partner/dashboard"
              element={
                <ProtectedRoute role="partner">{withShell(<PartnerDashboard />)}</ProtectedRoute>
              }
            />
            <Route
              path="/partner/:id"
              element={
                <ProtectedRoute>{withShell(<PartnerProfile />)}</ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
