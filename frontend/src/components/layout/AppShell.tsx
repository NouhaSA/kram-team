import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  Activity,
  Bell,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  QrCode,
  ScrollText,
  Sun,
  Users,
  Wallet,
  X,
  HeartPulse,
  Tag,
  Ticket,
  History,
  UserCog,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { useTheme } from '@/theme/ThemeContext'
import { getUnreadCount } from '@/api/notifications'
import type { UserRole } from '@/types/api'
import type { LucideIcon } from 'lucide-react'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  roles: readonly UserRole[]
}

const links: NavItem[] = [
  { to: '/app/admin', label: 'Admin', icon: LayoutDashboard, roles: ['admin'] },
  { to: '/app/control', label: 'Contrôle', icon: History, roles: ['admin'] },
  { to: '/app/staff', label: 'Comptes', icon: UserCog, roles: ['admin'] },
  { to: '/app/reception', label: 'Gestionnaire', icon: ClipboardList, roles: ['admin', 'reception'] },
  { to: '/app/qr', label: 'Scan QR', icon: QrCode, roles: ['admin', 'reception', 'coach'] },
  { to: '/app/coach', label: 'Coach', icon: Dumbbell, roles: ['admin', 'coach'] },
  { to: '/app/coach-reports', label: 'Stats coach', icon: Activity, roles: ['admin', 'reception', 'coach'] },
  { to: '/app/member', label: 'Adhérent', icon: Users, roles: ['admin', 'member'] },
  { to: '/app/members', label: 'Membres', icon: Users, roles: ['admin', 'reception', 'coach'] },
  { to: '/app/offers', label: 'Offres', icon: Tag, roles: ['admin', 'reception', 'coach', 'member'] },
  { to: '/app/subscriptions', label: 'Abonnements', icon: Ticket, roles: ['admin', 'reception'] },
  { to: '/app/bookings', label: 'Réservations', icon: CalendarDays, roles: ['admin', 'reception', 'coach', 'member'] },
  { to: '/app/schedule', label: 'Planning', icon: ScrollText, roles: ['admin', 'reception', 'coach'] },
  { to: '/app/health', label: 'Santé', icon: HeartPulse, roles: ['admin', 'reception', 'coach', 'member'] },
  { to: '/app/green', label: 'Green', icon: Gift, roles: ['admin', 'reception', 'coach', 'member'] },
  { to: '/app/payments', label: 'Paiements', icon: Wallet, roles: ['admin', 'reception'] },
]

export function AppShell() {
  const { user, logout, hasRole } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const visible = links.filter((link) => hasRole(...link.roles))

  const unreadQuery = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
  })
  const unread = unreadQuery.data?.unread_count ?? 0

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {visible.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-kt-red text-white'
                    : 'text-[var(--shell-stone)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)]'
                }`
              }
            >
              <Icon size={16} className="shrink-0 opacity-90" />
              <span>{link.label}</span>
            </NavLink>
          )
        })}
        <NavLink
          to="/app/notifications"
          onClick={onNavigate}
          className={({ isActive }) =>
            `mt-2 flex items-center gap-3 px-3 py-2.5 text-sm transition ${
              isActive
                ? 'bg-kt-red text-white'
                : 'text-[var(--shell-stone)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)]'
            }`
          }
        >
          <Bell size={16} className="shrink-0 opacity-90" />
          <span className="flex-1">Notifications</span>
          {unread > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center bg-kt-red px-1.5 text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </NavLink>
      </nav>
    )
  }

  return (
    <div
      className="app-shell min-h-svh"
      data-theme={theme}
      style={{ background: 'var(--shell-bg)', color: 'var(--shell-text)' }}
    >
      <div className="flex min-h-svh">
        {/* Desktop sidebar */}
        <aside
          className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r lg:flex"
          style={{
            background: 'var(--shell-panel)',
            borderColor: 'var(--shell-border)',
          }}
        >
          <Link to="/app" className="flex items-center gap-3 border-b px-4 py-5" style={{ borderColor: 'var(--shell-border)' }}>
            <img src="/logo.png" alt="Kram Team" className="h-10 w-10 object-contain" />
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.18em] uppercase leading-none">
                Kram Team
              </p>
              <p className="mt-1 text-[10px] tracking-[0.22em] text-kt-red uppercase">Force & Honor</p>
            </div>
          </Link>

          <SidebarNav />

          <div className="border-t p-4" style={{ borderColor: 'var(--shell-border)' }}>
            <p className="truncate text-sm font-medium">{user?.full_name}</p>
            <p className="truncate text-xs" style={{ color: 'var(--shell-muted)' }}>
              {user?.roles?.join(' · ')}
            </p>
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.button
                type="button"
                aria-label="Fermer le menu"
                className="fixed inset-0 z-40 bg-black/55 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r lg:hidden"
                style={{
                  background: 'var(--shell-panel)',
                  borderColor: 'var(--shell-border)',
                }}
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              >
                <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: 'var(--shell-border)' }}>
                  <Link to="/app" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                    <img src="/logo.png" alt="Kram Team" className="h-9 w-9 object-contain" />
                    <span className="font-[family-name:var(--font-display)] tracking-[0.18em] uppercase">
                      Kram Team
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="border p-2"
                    style={{ borderColor: 'var(--shell-border)', color: 'var(--shell-stone)' }}
                    aria-label="Fermer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur-md sm:px-6"
            style={{
              background: 'color-mix(in oklab, var(--shell-panel) 88%, transparent)',
              borderColor: 'var(--shell-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="border p-2 lg:hidden"
                style={{ borderColor: 'var(--shell-border)', color: 'var(--shell-stone)' }}
                onClick={() => setMobileOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <Menu size={16} />
              </button>
              <p className="hidden text-sm sm:block" style={{ color: 'var(--shell-muted)' }}>
                Plateforme · API v1
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="border p-2 transition hover:border-kt-red"
                style={{ borderColor: 'var(--shell-border)', color: 'var(--shell-stone)' }}
                aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <Link
                to="/app/notifications"
                className="relative border p-2 transition hover:border-kt-red"
                style={{ borderColor: 'var(--shell-border)', color: 'var(--shell-stone)' }}
                aria-label="Notifications"
              >
                <Bell size={16} />
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-kt-red px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                ) : null}
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="border p-2 transition hover:border-kt-red"
                style={{ borderColor: 'var(--shell-border)', color: 'var(--shell-stone)' }}
                aria-label="Déconnexion"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Outlet />
            </motion.div>
          </main>

          <footer
            className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 pb-8 text-xs sm:px-6"
            style={{ color: 'var(--shell-muted)' }}
          >
            <LayoutDashboard size={12} />
            <span>Plateforme Kram Team</span>
            <Users size={12} className="ml-2" />
            <span>API v1</span>
          </footer>
        </div>
      </div>
    </div>
  )
}
