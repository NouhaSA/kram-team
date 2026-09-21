import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getReceptionDashboard } from '@/api/dashboard'
import { EmptyState, ErrorState, LoadingState, Section, StatCard } from '@/components/ui/DashboardBits'

export function ReceptionDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'reception'],
    queryFn: getReceptionDashboard,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={(error as Error)?.message ?? 'Erreur'} />

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Gestionnaire</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Check-in live
      </h1>

      <div className="mt-6">
        <Link
          to="/app/qr"
          className="inline-flex bg-kt-red px-5 py-3 text-sm font-semibold tracking-wide text-white uppercase transition hover:bg-kt-red-hot"
        >
          Ouvrir le Scan QR
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Check-ins" value={data.kpis.checkins_today} hint="Aujourd'hui" />
        <StatCard label="Sessions ouvertes" value={data.kpis.open_sessions} />
        <StatCard label="Refus" value={data.kpis.denied_today} />
        <StatCard label="Réservations" value={data.kpis.bookings_today} />
      </div>

      <Section title="Sessions en cours">
        {data.open_sessions.length === 0 ? (
          <EmptyState message="Personne en salle pour le moment." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {data.open_sessions.map((s) => (
              <li key={s.id} className="flex justify-between px-4 py-3 text-sm">
                <span>{s.member}</span>
                <span className="text-kt-stone">
                  {s.checked_in_at ? new Date(s.checked_in_at).toLocaleTimeString('fr-FR') : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Créneaux bientôt">
        {data.upcoming_slots.length === 0 ? (
          <EmptyState message="Aucun créneau dans les 6 prochaines heures." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {data.upcoming_slots.map((s) => (
              <li key={s.id} className="px-4 py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">{s.course}</span>
                  <span className="text-kt-red">
                    {s.booked_count}/{s.capacity}
                  </span>
                </div>
                <p className="text-kt-stone">
                  {new Date(s.starts_at).toLocaleString('fr-FR')}
                  {s.room ? ` · ${s.room}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
