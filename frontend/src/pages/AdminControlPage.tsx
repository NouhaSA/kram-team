import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAccounts, listActivity, toggleAccount } from '@/api/admin'
import { ApiError } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, Section } from '@/components/ui/DashboardBits'

const ROLE_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'reception', label: 'Gestionnaire' },
  { value: 'coach', label: 'Coach' },
  { value: 'member', label: 'Adhérent' },
  { value: 'admin', label: 'Admin' },
]

function roleBadges(roles: string[]) {
  return roles
    .map((r) =>
      r === 'reception' ? 'Gestionnaire' : r === 'member' ? 'Adhérent' : r.charAt(0).toUpperCase() + r.slice(1),
    )
    .join(' · ')
}

export function AdminControlPage() {
  const queryClient = useQueryClient()
  const [roleFilter, setRoleFilter] = useState('')
  const [accountRole, setAccountRole] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const activityQuery = useQuery({
    queryKey: ['admin-activity', roleFilter],
    queryFn: () => listActivity({ role: roleFilter || undefined }),
  })

  const accountsQuery = useQuery({
    queryKey: ['admin-accounts', accountRole],
    queryFn: () => listAccounts(accountRole || undefined),
  })

  const toggle = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      toggleAccount(id, is_active),
    onSuccess: async (_, vars) => {
      setMsg(vars.is_active ? 'Compte activé.' : 'Compte désactivé.')
      setErr(null)
      await queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
      await queryClient.invalidateQueries({ queryKey: ['admin-activity'] })
      await queryClient.invalidateQueries({ queryKey: ['admin-staff'] })
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : 'Erreur'),
  })

  const pendingHint = useMemo(
    () => activityQuery.data?.filter((a) => a.action.includes('pending')).length ?? 0,
    [activityQuery.data],
  )

  if (activityQuery.isLoading || accountsQuery.isLoading) return <LoadingState />
  if (activityQuery.error) return <ErrorState message={(activityQuery.error as Error).message} />

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Contrôle</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Privilèges & historique
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-kt-stone">
        Vue admin : activer/désactiver les comptes (gestionnaire, coach, adhérent) et suivre toutes
        les actions. Les réservations en attente se valident dans{' '}
        <Link to="/app/bookings" className="text-kt-red underline">
          Réservations
        </Link>
        .
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/app/staff"
          className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-kt-red"
        >
          Créer gestionnaire / coach
        </Link>
        <Link
          to="/app/bookings"
          className="bg-kt-red px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase"
        >
          Valider réservations
        </Link>
        <Link
          to="/app/green"
          className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-emerald-500"
        >
          Valider Green
        </Link>
      </div>

      {msg ? (
        <p className="mt-4 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {msg}
        </p>
      ) : null}
      {err ? (
        <div className="mt-4">
          <ErrorState message={err} />
        </div>
      ) : null}

      <Section title="Comptes (contrôle privilèges)">
        <div className="mb-3 flex flex-wrap gap-2">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value || 'all'}
              type="button"
              onClick={() => setAccountRole(f.value)}
              className={`px-3 py-1.5 text-xs tracking-wide uppercase transition ${
                accountRole === f.value
                  ? 'bg-kt-red text-white'
                  : 'border border-white/15 hover:border-kt-red'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!accountsQuery.data?.length ? (
          <EmptyState message="Aucun compte." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {accountsQuery.data.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-kt-stone">
                    {u.email} · {roleBadges(u.roles)}
                    {!u.is_active ? ' · inactif' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle.mutate({ id: u.id, is_active: !u.is_active })}
                  disabled={toggle.isPending}
                  className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-kt-red"
                >
                  {u.is_active ? 'Désactiver' : 'Activer'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Historique des actions${pendingHint ? ` · ${pendingHint} pending récents` : ''}`}>
        <div className="mb-3 flex flex-wrap gap-2">
          {ROLE_FILTERS.map((f) => (
            <button
              key={`act-${f.value || 'all'}`}
              type="button"
              onClick={() => setRoleFilter(f.value)}
              className={`px-3 py-1.5 text-xs tracking-wide uppercase transition ${
                roleFilter === f.value
                  ? 'bg-kt-red text-white'
                  : 'border border-white/15 hover:border-kt-red'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!activityQuery.data?.length ? (
          <EmptyState message="Aucune action enregistrée pour l’instant. Les prochaines actions apparaîtront ici." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {activityQuery.data.map((a) => (
              <li key={a.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">{a.description}</p>
                  <span className="text-xs tracking-wider text-kt-muted uppercase">
                    {a.actor_role_label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-kt-stone">
                  {a.user?.full_name ?? 'Système'}
                  {a.user?.email ? ` · ${a.user.email}` : ''}
                  {a.created_at ? ` · ${new Date(a.created_at).toLocaleString('fr-FR')}` : ''}
                  {` · ${a.action}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
