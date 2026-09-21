import { useQuery } from '@tanstack/react-query'
import { getMemberDashboard } from '@/api/dashboard'
import { EmptyState, ErrorState, LoadingState, Section, StatCard } from '@/components/ui/DashboardBits'
import { MemberQrCard } from '@/components/qr/MemberQrCard'

export function MemberDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'member'],
    queryFn: getMemberDashboard,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={(error as Error)?.message ?? 'Erreur'} />

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Espace adhérent</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        {data.member.full_name}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Abonnement"
          value={data.subscription?.offer ?? 'Aucun'}
          hint={data.subscription?.ends_at ? `Expire ${new Date(data.subscription.ends_at).toLocaleDateString('fr-FR')}` : undefined}
        />
        <StatCard label="Eco points" value={data.green.eco_points} />
        <StatCard label="Green score" value={data.green.green_score} />
        <StatCard label="Niveau" value={data.green.green_level} />
      </div>

      <Section title="Mon QR code">
        <MemberQrCard value={data.member.qr_uuid} label={data.member.full_name} />
      </Section>

      <Section title="Quotas">
        {data.quotas.length === 0 ? (
          <EmptyState message="Aucun quota actif." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.quotas.map((q) => (
              <div key={q.id} className="border border-white/8 p-4">
                <p className="font-medium">{q.label}</p>
                <p className="mt-2 text-sm text-kt-stone">
                  {q.is_unlimited
                    ? 'Illimité'
                    : `${q.remaining ?? 0} / ${q.total ?? 0} restants`}
                </p>
                {q.alert ? <p className="mt-1 text-xs text-kt-red">{q.alert}</p> : null}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Prochaines séances">
        {data.next_bookings.length === 0 ? (
          <EmptyState message="Aucune réservation à venir." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {data.next_bookings.map((b) => (
              <li key={b.id} className="px-4 py-3 text-sm">
                <p className="font-medium">{b.course}</p>
                <p className="text-kt-stone">
                  {b.starts_at ? new Date(b.starts_at).toLocaleString('fr-FR') : '—'}
                  {b.room ? ` · ${b.room}` : ''}
                  {b.coach ? ` · ${b.coach}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
