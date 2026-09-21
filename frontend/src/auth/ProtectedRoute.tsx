import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import type { UserRole } from '@/types/api'
import { LoadingState } from '@/components/ui/DashboardBits'

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading, hasRole } = useAuth()

  if (loading) return <LoadingState />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !hasRole(...roles)) return <Navigate to="/app" replace />

  return <Outlet />
}
