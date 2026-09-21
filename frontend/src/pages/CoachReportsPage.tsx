import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { getCoachReports, type CoachReportPeriod } from '@/api/reports'
import { EmptyState, ErrorState, LoadingState, Section, StatCard } from '@/components/ui/DashboardBits'
import { useAuth } from '@/auth/AuthContext'

export function CoachReportsPage() {
  const { hasRole } = useAuth()
  const canPickCoach = hasRole('admin', 'reception')
  const [period, setPeriod] = useState<CoachReportPeriod>('month')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [coachId, setCoachId] = useState('')

  const query = useQuery({
    queryKey: ['coach-reports', period, date, coachId],
    queryFn: () =>
      getCoachReports({
        period,
        date,
        coach_id: coachId ? Number(coachId) : undefined,
      }),
  })

  const coachOptions = useMemo(() => {
    const list = query.data?.coaches ?? []
    return list.map((c) => ({ id: c.coach.id, name: c.coach.full_name }))
  }, [query.data])

  if (query.isLoading) return <LoadingState />
  if (query.error || !query.data) {
    return <ErrorState message={(query.error as Error)?.message ?? 'Erreur'} />
  }

  const { totals, coaches, period_label, from, to } = query.data
  const currency = totals.currency ?? 'TND'

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Analytics</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Stats & salaire coach
      </h1>
      <p className="mt-2 text-sm text-kt-stone">
        {period_label} · {new Date(from).toLocaleDateString('fr-FR')} →{' '}
        {new Date(to).toLocaleDateString('fr-FR')}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {(['day', 'week', 'month'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-xs tracking-wide uppercase transition ${
              period === p ? 'bg-kt-red text-white' : 'border border-white/15 text-kt-stone hover:text-white'
            }`}
          >
            {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
          </button>
        ))}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
        />
        {canPickCoach ? (
          <select
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          >
            <option value="">Tous les coachs</option>
            {coachOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Séances" value={totals.sessions} />
        <StatCard label="Heures" value={`${totals.hours} h`} />
        <StatCard label="Personnes" value={totals.people_trained} />
        <StatCard label="Réservations" value={totals.bookings} />
        <StatCard
          label="Masse salariale"
          value={`${totals.salary ?? 0} ${currency}`}
          hint="Σ heures × taux"
        />
      </div>

      {!coaches.length ? (
        <Section title="Détail">
          <EmptyState message="Aucune activité coach sur cette période." />
        </Section>
      ) : (
        coaches.map((coach) => (
          <Section key={coach.coach.id} title={coach.coach.full_name}>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <p className="text-sm text-kt-stone">
                Séances <span className="block text-2xl text-white">{coach.sessions}</span>
              </p>
              <p className="text-sm text-kt-stone">
                Heures <span className="block text-2xl text-white">{coach.hours} h</span>
              </p>
              <p className="text-sm text-kt-stone">
                Taux <span className="block text-2xl text-white">{coach.hourly_rate} {coach.currency}/h</span>
              </p>
              <p className="text-sm text-kt-stone">
                Salaire période{' '}
                <span className="block text-2xl text-emerald-400">
                  {coach.salary} {coach.currency}
                </span>
              </p>
              <p className="text-sm text-kt-stone">
                Personnes <span className="block text-2xl text-white">{coach.people_trained}</span>
              </p>
            </div>

            {coach.slots.length ? (
              <ul className="divide-y divide-white/5 border border-white/8">
                {coach.slots.map((s) => (
                  <li key={s.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{s.course ?? `Créneau #${s.id}`}</p>
                      <p className="text-kt-stone">
                        {new Date(s.starts_at).toLocaleString('fr-FR')}
                        {s.room ? ` · ${s.room}` : ''}
                      </p>
                    </div>
                    <div className="text-right text-kt-muted">
                      <p>
                        {s.hours} h · {s.slot_pay ?? 0} {coach.currency}
                      </p>
                      <p>
                        {s.booked_count}/{s.capacity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="Aucun créneau sur la période." />
            )}
          </Section>
        ))
      )}
    </div>
  )
}
