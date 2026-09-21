import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/auth/AuthContext'
import { ThemeProvider } from '@/theme/ThemeContext'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { AppHome } from '@/pages/AppHome'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { AdminControlPage } from '@/pages/AdminControlPage'
import { MemberDashboardPage } from '@/pages/MemberDashboardPage'
import { ReceptionDashboardPage } from '@/pages/ReceptionDashboardPage'
import { CoachDashboardPage } from '@/pages/CoachDashboardPage'
import { MembersPage } from '@/pages/MembersPage'
import { OffersPage } from '@/pages/OffersPage'
import { BookingsPage } from '@/pages/BookingsPage'
import { QrScanPage } from '@/pages/QrScanPage'
import { LandingPage } from '@/pages/LandingPage'
import { GreenRewardsPage } from '@/pages/GreenRewardsPage'
import { PaymentsPage } from '@/pages/PaymentsPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { SubscriptionsPage } from '@/pages/SubscriptionsPage'
import { PublicPlanningPage } from '@/pages/PublicPlanningPage'
import { SchedulePage } from '@/pages/SchedulePage'
import { CoachReportsPage } from '@/pages/CoachReportsPage'
import { HealthTrackingPage } from '@/pages/HealthTrackingPage'
import { MemberStatsPage } from '@/pages/MemberStatsPage'
import { StaffAccountsPage } from '@/pages/StaffAccountsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/planning" element={<PublicPlanningPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AppShell />}>
                  <Route index element={<AppHome />} />
                  <Route element={<ProtectedRoute roles={['admin']} />}>
                    <Route path="admin" element={<AdminDashboardPage />} />
                    <Route path="staff" element={<StaffAccountsPage />} />
                    <Route path="control" element={<AdminControlPage />} />
                  </Route>
                  <Route element={<ProtectedRoute roles={['admin', 'coach']} />}>
                    <Route path="coach" element={<CoachDashboardPage />} />
                  </Route>
                  <Route element={<ProtectedRoute roles={['admin', 'reception']} />}>
                    <Route path="reception" element={<ReceptionDashboardPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="subscriptions" element={<SubscriptionsPage />} />
                  </Route>
                  <Route element={<ProtectedRoute roles={['admin', 'member']} />}>
                    <Route path="member" element={<MemberDashboardPage />} />
                  </Route>
                <Route element={<ProtectedRoute roles={['admin', 'reception', 'coach']} />}>
                  <Route path="members" element={<MembersPage />} />
                  <Route path="members/:memberId/stats" element={<MemberStatsPage />} />
                  <Route path="qr" element={<QrScanPage />} />
                  <Route path="schedule" element={<SchedulePage />} />
                  <Route path="coach-reports" element={<CoachReportsPage />} />
                </Route>
                  <Route element={<ProtectedRoute roles={['admin', 'reception', 'coach', 'member']} />}>
                    <Route path="offers" element={<OffersPage />} />
                    <Route path="bookings" element={<BookingsPage />} />
                    <Route path="green" element={<GreenRewardsPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="health" element={<HealthTrackingPage />} />
                  </Route>
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
