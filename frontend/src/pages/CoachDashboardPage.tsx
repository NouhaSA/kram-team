import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCoachDashboard } from '@/api/dashboard'
import { EmptyState, ErrorState, LoadingState, Section, StatCard } from '@/components/ui/DashboardBits'

export function CoachDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'coach'],
    queryFn: getCoachDashboard,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={(error as Error)?.message ?? 'Erreur'} />

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Espace coach</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        {data.coach.full_name}
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/app/coach-reports"
          className="bg-kt-red px-4 py-2 text-xs font-semibold tracking-wide text-white uppercase"
        >
          Stats & salaire
        </Link>
        <Link
          to="/app/qr"
          className="border border-white/15 px-4 py-2 text-xs tracking-wide uppercase transition hover:border-kt-red"
        >
          Scan QR
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Séances aujourd'hui" value={data.kpis.sessions_today} />
        <StatCard label="À venir" value={data.kpis.upcoming_sessions} />
        <StatCard label="Membres" value={data.kpis.assigned_members} />
      </div>

      <Section title="Mes créneaux">
        {data.upcoming_slots.length === 0 ? (
          <EmptyState message="Aucun créneau planifié." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {data.upcoming_slots.map((s) => (
              <li key={s.id} className="px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{s.course}</span>
                  <span className="text-kt-red">
                    {s.booked_count}/{s.capacity} places
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

      <Section title="Membres assignés">
        {data.assigned_members.length === 0 ? (
          <EmptyState message="Aucun membre assigné." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {data.assigned_members.map((m) => (
              <li key={m.id} className="flex justify-between px-4 py-3 text-sm">
                <span>{m.full_name}</span>
                <span className="text-kt-stone">{m.eco_points} pts</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
