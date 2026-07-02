import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role, children }) {
  const { role: currentRole } = useAuth()

  if (!currentRole) {
    return <Navigate to={role === 'partner' ? '/partner/login' : '/login'} replace />
  }

  if (role && currentRole !== role) {
    return <Navigate to={currentRole === 'partner' ? '/partner/dashboard' : '/feed'} replace />
  }

  return children
}
