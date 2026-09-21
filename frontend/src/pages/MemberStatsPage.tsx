import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMemberStats } from '@/api/dashboard'
import { EmptyState, ErrorState, LoadingState, Section, StatCard } from '@/components/ui/DashboardBits'

export function MemberStatsPage() {
  const { memberId } = useParams()
  const id = Number(memberId)

  const { data, isLoading, error } = useQuery({
    queryKey: ['member-stats', id],
    queryFn: () => getMemberStats(id),
    enabled: Number.isFinite(id) && id > 0,
  })

  if (!Number.isFinite(id) || id <= 0) {
    return <ErrorState message="Adhérent invalide." />
  }
  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={(error as Error)?.message ?? 'Erreur'} />

  const { member, stats, subscription, quotas, next_bookings, recent_attendances, recent_payments, health, green, charts } =
    data

  const maxAttendance = Math.max(1, ...charts.attendance_last_30_days.map((d) => d.total))

  return (
    <div>
      <Link to="/app/members" className="text-xs tracking-wider text-kt-muted uppercase transition hover:text-kt-red">
        ← Adhérents
      </Link>
      <p className="mt-3 text-xs tracking-[0.3em] text-kt-red uppercase">Statistiques</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-kt-cream uppercase">
        {member.full_name}
      </h1>
      <p className="mt-2 text-sm text-kt-stone">
        {member.email}
        {member.phone ? ` · ${member.phone}` : ''}
        {member.city ? ` · ${member.city}` : ''}
        {member.coach ? ` · Coach ${member.coach}` : ''}
      </p>
      <p className="mt-1 font-mono text-xs text-kt-muted">{member.qr_uuid}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Présences / mois" value={stats.attendances_month} />
        <StatCard label="Heures / mois" value={`${stats.hours_month} h`} />
        <StatCard label="Résas à venir" value={stats.bookings_upcoming} />
        <StatCard label="Dépenses / mois" value={`${stats.spent_month} ${stats.currency}`} />
        <StatCard label="Présences totales" value={stats.attendances_total} />
        <StatCard label="Résas totales" value={stats.bookings_total} />
        <StatCard label="Dépenses totales" value={`${stats.spent_total} ${stats.currency}`} />
        <StatCard label="Eco points" value={green.eco_points} hint={`Niveau ${green.green_level}`} />
      </div>

      <Section title="Abonnement & quotas">
        {subscription ? (
          <div className="border border-white/8 p-4">
            <p className="font-medium">{subscription.offer}</p>
            <p className="text-sm text-kt-stone">
              {subscription.status}
              {subscription.ends_at
                ? ` · expire ${new Date(subscription.ends_at).toLocaleDateString('fr-FR')}`
                : ''}
            </p>
            {quotas?.length ? (
              <ul className="mt-4 space-y-2 text-sm text-kt-stone">
                {quotas.map((q) => (
                  <li key={q.id} className="flex justify-between gap-3 border-t border-white/5 pt-2">
                    <span>{q.label}</span>
                    <span>
                      {q.is_unlimited ? 'Illimité' : `${q.remaining ?? 0} / ${q.total ?? 0}`}
                      {q.alert ? ` · ${q.alert}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <EmptyState message="Aucun abonnement actif." />
        )}
      </Section>

      <Section title="Présences (30 jours)">
        {!charts.attendance_last_30_days.length ? (
          <EmptyState message="Aucune présence récente." />
        ) : (
          <div className="flex h-40 items-end gap-1 border border-white/8 p-3">
            {charts.attendance_last_30_days.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full bg-kt-red/80"
                  style={{ height: `${Math.max(8, (d.total / maxAttendance) * 100)}%` }}
                  title={`${d.date}: ${d.total}`}
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Santé">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <p className="border border-white/8 p-3">
            <span className="block text-xs text-kt-muted uppercase">Poids</span>
            {health.current_weight_kg != null ? `${health.current_weight_kg} kg` : '—'}
          </p>
          <p className="border border-white/8 p-3">
            <span className="block text-xs text-kt-muted uppercase">Taille</span>
            {health.height_cm != null ? `${health.height_cm} cm` : '—'}
          </p>
          <p className="border border-white/8 p-3">
            <span className="block text-xs text-kt-muted uppercase">Objectif</span>
            {health.goal_label ?? '—'}
          </p>
          <p className="border border-white/8 p-3">
            <span className="block text-xs text-kt-muted uppercase">Cible</span>
            {health.target_weight_kg != null ? `${health.target_weight_kg} kg` : '—'}
          </p>
        </div>
        {member.goals ? <p className="mt-3 text-sm text-kt-stone">{member.goals}</p> : null}
      </Section>

      <Section title="Prochaines réservations">
        {!next_bookings.length ? (
          <EmptyState message="Aucune réservation à venir." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {next_bookings.map((b) => (
              <li key={b.id} className="px-4 py-3 text-sm">
                <p className="font-medium">{b.course ?? 'Cours'}</p>
                <p className="text-kt-stone">
                  {b.starts_at ? new Date(b.starts_at).toLocaleString('fr-FR') : '—'}
                  {b.coach ? ` · ${b.coach}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Dernières présences">
          {!recent_attendances.length ? (
            <EmptyState message="Aucune présence." />
          ) : (
            <ul className="divide-y divide-white/5 border border-white/8">
              {recent_attendances.map((a) => (
                <li key={a.id} className="px-4 py-3 text-sm">
                  <p className="font-medium">
                    {a.checked_in_at ? new Date(a.checked_in_at).toLocaleString('fr-FR') : '—'}
                  </p>
                  <p className="text-kt-stone">
                    {a.activity_type ?? 'Séance'}
                    {a.duration_minutes != null ? ` · ${a.duration_minutes} min` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Derniers paiements">
          {!recent_payments.length ? (
            <EmptyState message="Aucun paiement." />
          ) : (
            <ul className="divide-y divide-white/5 border border-white/8">
              {recent_payments.map((p) => (
                <li key={p.id} className="flex justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{p.reference}</p>
                    <p className="text-kt-stone">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString('fr-FR') : '—'} · {p.method}
                    </p>
                  </div>
                  <p>{p.amount} TND</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  )
}
