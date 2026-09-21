import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import type { UserRole } from '@/types/api'

function homeForRoles(roles: UserRole[]) {
  if (roles.includes('admin')) return '/app/admin'
  if (roles.includes('reception')) return '/app/reception'
  if (roles.includes('coach')) return '/app/coach'
  return '/app/member'
}

export function AppHome() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={homeForRoles(user.roles)} replace />
}
