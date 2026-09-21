import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '@/api/dashboard'
import { EmptyState, ErrorState, LoadingState, Section, StatCard } from '@/components/ui/DashboardBits'

export function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: getAdminDashboard,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={(error as Error)?.message ?? 'Erreur'} />

  const { kpis, charts, green } = data

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Dashboard</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Administration
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Membres actifs" value={kpis.active_members} />
        <StatCard label="Abonnements" value={kpis.active_subscriptions} hint={`${kpis.subscriptions_expiring_7d} expirent sous 7j`} />
        <StatCard label="Revenu mois" value={`${kpis.revenue_month} ${kpis.currency}`} hint={`Aujourd'hui: ${kpis.revenue_today}`} />
        <StatCard label="Présences / résas" value={`${kpis.attendances_today} / ${kpis.bookings_today}`} hint="Aujourd'hui" />
      </div>

      <Section title="Accès rapide">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/app/control"
            className="border border-white/15 px-3 py-2 text-xs tracking-wide uppercase transition hover:border-kt-red"
          >
            Contrôle & historique
          </Link>
          <Link
            to="/app/bookings"
            className="bg-kt-red px-3 py-2 text-xs font-semibold tracking-wide text-white uppercase"
          >
            Valider réservations
          </Link>
          <Link
            to="/app/staff"
            className="border border-white/15 px-3 py-2 text-xs tracking-wide uppercase transition hover:border-kt-red"
          >
            Comptes staff
          </Link>
        </div>
      </Section>

      <Section title="Green impact">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Eco points" value={green.total_eco_points} />
          <StatCard label="CO₂ (kg)" value={green.co2_kg} />
          <StatCard label="Arbres" value={green.trees_planted} />
        </div>
      </Section>

      <Section title="Cours populaires">
        {charts.popular_courses.length === 0 ? (
          <EmptyState message="Pas encore de réservations." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {charts.popular_courses.map((row) => (
              <li key={row.course} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{row.course}</span>
                <span className="text-kt-red">{row.bookings} résas</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
