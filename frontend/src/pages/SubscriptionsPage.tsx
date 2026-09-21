import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import {
  activateSubscription,
  cancelSubscription,
  createSubscription,
  listSubscriptions,
  renewSubscription,
  suspendSubscription,
} from '@/api/subscriptions'
import { listMembers } from '@/api/members'
import { listOffers } from '@/api/offers'
import { ApiError } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, Section } from '@/components/ui/DashboardBits'

export function SubscriptionsPage() {
  const queryClient = useQueryClient()
  const subsQuery = useQuery({ queryKey: ['subscriptions'], queryFn: () => listSubscriptions() })
  const membersQuery = useQuery({ queryKey: ['members'], queryFn: listMembers })
  const offersQuery = useQuery({ queryKey: ['offers'], queryFn: listOffers })

  const [memberId, setMemberId] = useState('')
  const [offerId, setOfferId] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
  }

  const create = useMutation({
    mutationFn: () =>
      createSubscription({
        member_id: Number(memberId),
        offer_id: Number(offerId),
        notes: notes || undefined,
      }),
    onSuccess: async () => {
      setMessage('Abonnement créé.')
      setError(null)
      setNotes('')
      await refresh()
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Erreur'),
  })

  const action = useMutation({
    mutationFn: async ({
      id,
      type,
    }: {
      id: number
      type: 'suspend' | 'activate' | 'cancel' | 'renew'
    }) => {
      if (type === 'suspend') return suspendSubscription(id)
      if (type === 'activate') return activateSubscription(id)
      if (type === 'cancel') return cancelSubscription(id)
      return renewSubscription(id)
    },
    onSuccess: async () => {
      setMessage('Abonnement mis à jour.')
      setError(null)
      await refresh()
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Erreur'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    create.mutate()
  }

  if (subsQuery.isLoading) return <LoadingState />
  if (subsQuery.error) return <ErrorState message={(subsQuery.error as Error).message} />

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Abonnements</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Subscriptions
      </h1>

      {message ? (
        <p className="mt-4 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}
      {error ? (
        <div className="mt-4">
          <ErrorState message={error} />
        </div>
      ) : null}

      <Section title="Nouvel abonnement">
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            required
          >
            <option value="">Adhérent…</option>
            {(membersQuery.data ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                #{m.id} · {m.user ? `${m.user.first_name} ${m.user.last_name}` : 'Membre'}
              </option>
            ))}
          </select>
          <select
            value={offerId}
            onChange={(e) => setOfferId(e.target.value)}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            required
          >
            <option value="">Offre…</option>
            {(offersQuery.data ?? []).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} · {o.effective_price} TND
              </option>
            ))}
          </select>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red sm:col-span-2"
          />
          <button
            type="submit"
            disabled={create.isPending}
            className="bg-kt-red px-4 py-2 text-sm font-semibold text-white hover:bg-kt-red-hot disabled:opacity-60 sm:col-span-2"
          >
            {create.isPending ? 'Création…' : 'Créer abonnement'}
          </button>
        </form>
      </Section>

      <Section title={`Liste (${subsQuery.data?.length ?? 0})`}>
        {!subsQuery.data?.length ? (
          <EmptyState message="Aucun abonnement." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {subsQuery.data.map((s) => {
              const name = s.member?.user
                ? `${s.member.user.first_name} ${s.member.user.last_name}`
                : `Membre #${s.member_id}`
              return (
                <li key={s.id} className="px-4 py-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-kt-stone">{s.offer?.name ?? `Offre #${s.offer_id}`}</p>
                      <p className="mt-1 text-xs text-kt-muted">
                        {s.status_label}
                        {s.ends_at
                          ? ` · expire ${new Date(s.ends_at).toLocaleDateString('fr-FR')}`
                          : ''}
                        {` · ${s.price_paid} TND`}
                      </p>
                      {s.quotas?.length ? (
                        <p className="mt-2 text-xs text-kt-stone">
                          {s.quotas
                            .map((q) =>
                              q.is_unlimited
                                ? `${q.label}: ∞`
                                : `${q.label}: ${q.remaining ?? 0}/${q.total ?? 0}`,
                            )
                            .join(' · ')}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.status === 'active' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => action.mutate({ id: s.id, type: 'suspend' })}
                            className="border border-white/15 px-2 py-1 text-xs uppercase tracking-wide hover:border-white/40"
                          >
                            Suspendre
                          </button>
                          <button
                            type="button"
                            onClick={() => action.mutate({ id: s.id, type: 'renew' })}
                            className="border border-white/15 px-2 py-1 text-xs uppercase tracking-wide hover:border-kt-red"
                          >
                            Renouveler
                          </button>
                          <button
                            type="button"
                            onClick={() => action.mutate({ id: s.id, type: 'cancel' })}
                            className="border border-kt-red/40 px-2 py-1 text-xs uppercase tracking-wide text-kt-red"
                          >
                            Résilier
                          </button>
                        </>
                      ) : null}
                      {s.status === 'suspended' ? (
                        <button
                          type="button"
                          onClick={() => action.mutate({ id: s.id, type: 'activate' })}
                          className="bg-kt-red px-2 py-1 text-xs uppercase tracking-wide text-white"
                        >
                          Réactiver
                        </button>
                      ) : null}
                      {s.status === 'expired' ? (
                        <button
                          type="button"
                          onClick={() => action.mutate({ id: s.id, type: 'renew' })}
                          className="bg-kt-red px-2 py-1 text-xs uppercase tracking-wide text-white"
                        >
                          Renouveler
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </div>
  )
}
