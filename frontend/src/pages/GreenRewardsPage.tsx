import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import {
  getChallenges,
  getEcoHistory,
  getEcoRules,
  getGreenProfile,
  getLeaderboard,
  getPendingEcoActions,
  getPendingRedemptions,
  getRewards,
  getMyRedemptions,
  joinChallenge,
  processRedemption,
  redeemReward,
  submitEcoAction,
  validateEcoAction,
} from '@/api/green'
import { ApiError } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, Section, StatCard } from '@/components/ui/DashboardBits'
import { useAuth } from '@/auth/AuthContext'

export function GreenRewardsPage() {
  const { hasRole, user } = useAuth()
  const canValidate = hasRole('admin', 'reception', 'coach')
  const queryClient = useQueryClient()

  const profileQuery = useQuery({ queryKey: ['green-profile'], queryFn: getGreenProfile })
  const rulesQuery = useQuery({ queryKey: ['eco-rules'], queryFn: getEcoRules })
  const challengesQuery = useQuery({ queryKey: ['eco-challenges'], queryFn: getChallenges })
  const rewardsQuery = useQuery({ queryKey: ['eco-rewards'], queryFn: getRewards })
  const redemptionsQuery = useQuery({ queryKey: ['eco-redemptions'], queryFn: getMyRedemptions })
  const boardQuery = useQuery({ queryKey: ['eco-leaderboard'], queryFn: () => getLeaderboard('global') })
  const historyQuery = useQuery({ queryKey: ['eco-history'], queryFn: getEcoHistory })
  const pendingQuery = useQuery({
    queryKey: ['eco-pending'],
    queryFn: getPendingEcoActions,
    enabled: canValidate,
  })
  const pendingRedemptionsQuery = useQuery({
    queryKey: ['eco-pending-redemptions'],
    queryFn: getPendingRedemptions,
    enabled: canValidate,
  })

  const [ruleId, setRuleId] = useState('')
  const [notes, setNotes] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['green-profile'] }),
      queryClient.invalidateQueries({ queryKey: ['eco-history'] }),
      queryClient.invalidateQueries({ queryKey: ['eco-leaderboard'] }),
      queryClient.invalidateQueries({ queryKey: ['eco-pending'] }),
      queryClient.invalidateQueries({ queryKey: ['eco-pending-redemptions'] }),
      queryClient.invalidateQueries({ queryKey: ['eco-rewards'] }),
      queryClient.invalidateQueries({ queryKey: ['eco-challenges'] }),
      queryClient.invalidateQueries({ queryKey: ['eco-redemptions'] }),
    ])
  }

  const submit = useMutation({
    mutationFn: () =>
      submitEcoAction(
        Number(ruleId),
        notes || undefined,
        user?.member?.id,
      ),
    onSuccess: async () => {
      setMsg('Action soumise.')
      setErr(null)
      setNotes('')
      await refresh()
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : 'Erreur'),
  })

  const join = useMutation({
    mutationFn: (id: number) => {
      if (!user?.member?.id) {
        throw new ApiError(
          'Compte adhérent requis. Connecte-toi avec member@kramteam.com pour rejoindre.',
          422,
        )
      }
      return joinChallenge(id, user.member.id)
    },
    onSuccess: async () => {
      setMsg('Challenge rejoint.')
      setErr(null)
      await refresh()
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : 'Impossible de rejoindre'),
  })

  const redeem = useMutation({
    mutationFn: (id: number) => {
      if (!user?.member?.id) {
        throw new ApiError('Compte adhérent requis pour échanger des points.', 422)
      }
      return redeemReward(id, user.member.id)
    },
    onSuccess: async () => {
      setMsg('Demande d’échange envoyée — en attente de validation.')
      setErr(null)
      await refresh()
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : 'Échange impossible'),
  })

  const validate = useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: 'approved' | 'rejected' }) =>
      validateEcoAction(id, decision, decision === 'rejected' ? 'Non conforme' : undefined),
    onSuccess: async () => {
      setMsg('Action traitée.')
      await refresh()
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : 'Erreur'),
  })

  const processExchange = useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: 'approved' | 'rejected' }) =>
      processRedemption(id, decision, decision === 'rejected' ? 'Indisponible' : undefined),
    onSuccess: async (_, vars) => {
      setMsg(vars.decision === 'approved' ? 'Échange accepté.' : 'Échange refusé.')
      await refresh()
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : 'Erreur'),
  })

  if (profileQuery.isLoading) return <LoadingState />
  if (profileQuery.error) {
    return <ErrorState message={(profileQuery.error as Error).message} />
  }

  const profile = profileQuery.data!

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    submit.mutate()
  }

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-emerald-400 uppercase">Green Rewards</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Eco Score
      </h1>

      {msg ? (
        <p className="mt-4 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">{msg}</p>
      ) : null}
      {err ? <div className="mt-4"><ErrorState message={err} /></div> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Eco points" value={profile.eco_points} />
        <StatCard label="Green score" value={profile.green_score} />
        <StatCard label="Niveau" value={profile.level?.name ?? `Lvl ${profile.green_level}`} />
        <StatCard
          label="Prochain niveau"
          value={profile.next_level ? profile.next_level.points_needed : '—'}
          hint={profile.next_level?.name}
        />
      </div>

      <Section title="Impact">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="CO₂ kg" value={profile.impact.co2_kg} />
          <StatCard label="Eau L" value={profile.impact.water_liters} />
          <StatCard label="Arbres" value={profile.impact.trees_planted} />
          <StatCard label="Déchets" value={profile.impact.waste_items} />
        </div>
      </Section>

      <Section title="Badges">
        {!profile.badges.length ? (
          <EmptyState message="Aucun badge pour l’instant." />
        ) : (
          <div className="flex flex-wrap gap-3">
            {profile.badges.map((b) => (
              <div key={b.id} className="border border-white/10 px-4 py-3 text-sm">
                <span className="mr-2">{b.icon}</span>
                {b.name}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Déclarer une action">
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <select
            value={ruleId}
            onChange={(e) => setRuleId(e.target.value)}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            required
          >
            <option value="">Action…</option>
            {(rulesQuery.data ?? []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (+{r.points})
              </option>
            ))}
          </select>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optionnel)"
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          />
          <button
            type="submit"
            disabled={submit.isPending}
            className="bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 sm:col-span-2"
          >
            {submit.isPending ? 'Envoi…' : 'Soumettre'}
          </button>
        </form>
      </Section>

      <Section title="Challenges">
        {!challengesQuery.data?.length ? (
          <EmptyState message="Aucun challenge actif." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {challengesQuery.data.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-kt-stone">{c.description}</p>
                  <p className="text-xs text-emerald-400">
                    +{c.reward_points} pts · objectif {c.target_count}
                    {c.joined ? ` · progression ${c.progress ?? 0}/${c.target_count}` : ''}
                  </p>
                </div>
                {c.joined ? (
                  <span className="border border-emerald-500/40 px-3 py-1.5 text-xs tracking-wide text-emerald-400 uppercase">
                    {c.completed ? 'Terminé' : 'Inscrit'}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => join.mutate(c.id)}
                    disabled={join.isPending || !user?.member?.id}
                    className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-emerald-500 disabled:opacity-40"
                  >
                    {join.isPending ? '…' : 'Rejoindre'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {!user?.member?.id ? (
          <p className="mt-3 text-xs text-kt-muted">
            Astuce : utilise un compte adhérent (`member@kramteam.com`) pour rejoindre les challenges.
          </p>
        ) : null}
      </Section>

      <Section title={`Boutique eco · solde ${profile.eco_points} pts`}>
        {!rewardsQuery.data?.length ? (
          <EmptyState message="Aucune récompense." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rewardsQuery.data.map((r) => {
              const affordable = (profile.eco_points ?? 0) >= r.cost_points
              const inStock = r.stock === null || r.stock > 0
              return (
                <div key={r.id} className="flex items-center justify-between gap-3 border border-white/8 p-4">
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-sm text-emerald-400">{r.cost_points} pts</p>
                    <p className="text-xs text-kt-muted">
                      {r.stock === null ? 'Stock illimité' : `Stock ${r.stock}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => redeem.mutate(r.id)}
                    disabled={!affordable || !inStock || redeem.isPending || !user?.member?.id}
                    className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-kt-red disabled:opacity-40"
                  >
                    {!inStock ? 'Épuisé' : !affordable ? 'Points insuffisants' : 'Échanger'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6">
          <p className="mb-2 text-xs tracking-wider text-kt-muted uppercase">Mes échanges</p>
          {!redemptionsQuery.data?.length ? (
            <p className="text-sm text-kt-muted">Aucun échange pour l’instant.</p>
          ) : (
            <ul className="divide-y divide-white/5 border border-white/8">
              {redemptionsQuery.data.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 px-4 py-3 text-sm">
                  <span>{item.reward?.name ?? 'Récompense'}</span>
                  <span className="text-right text-kt-stone">
                    -{item.points_spent} pts · {item.status}
                    {item.redeemed_at ? ` · ${new Date(item.redeemed_at).toLocaleDateString('fr-FR')}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      <Section title="Classement">
        {!boardQuery.data?.length ? (
          <EmptyState message="Pas encore de classement." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {boardQuery.data.map((row, i) => (
              <li key={row.member_id} className="flex justify-between px-4 py-3 text-sm">
                <span>
                  #{row.rank ?? i + 1} {row.full_name}
                </span>
                <span className="text-emerald-400">{row.eco_points} pts</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Mon historique">
        {!historyQuery.data?.length ? (
          <EmptyState message="Aucune action." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {historyQuery.data.map((a) => (
              <li key={a.id} className="flex justify-between px-4 py-3 text-sm">
                <span>{a.rule?.name ?? 'Action'}</span>
                <span className="text-kt-stone">
                  {a.status} · +{a.points}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {canValidate ? (
        <>
          <Section title="Actions Green à valider">
            {!pendingQuery.data?.length ? (
              <EmptyState message="File d’attente vide." />
            ) : (
              <ul className="divide-y divide-white/5 border border-white/8">
                {pendingQuery.data.map((a) => {
                  const name = a.member?.user
                    ? `${a.member.user.first_name} ${a.member.user.last_name}`
                    : `Action #${a.id}`
                  return (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-kt-stone">{a.rule?.name} · +{a.points}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => validate.mutate({ id: a.id, decision: 'approved' })}
                          className="bg-emerald-600 px-3 py-1.5 text-xs text-white"
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={() => validate.mutate({ id: a.id, decision: 'rejected' })}
                          className="border border-kt-red/50 px-3 py-1.5 text-xs text-kt-red"
                        >
                          Refuser
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Section>

          <Section title="Échanges boutique à accepter">
            {!pendingRedemptionsQuery.data?.length ? (
              <EmptyState message="Aucun échange en attente." />
            ) : (
              <ul className="divide-y divide-white/5 border border-white/8">
                {pendingRedemptionsQuery.data.map((r) => {
                  const name = r.member?.user
                    ? `${r.member.user.first_name} ${r.member.user.last_name}`
                    : `Échange #${r.id}`
                  return (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-kt-stone">
                          {r.reward?.name ?? 'Récompense'} · {r.points_spent} pts
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => processExchange.mutate({ id: r.id, decision: 'approved' })}
                          disabled={processExchange.isPending}
                          className="bg-emerald-600 px-3 py-1.5 text-xs text-white"
                        >
                          Accepter
                        </button>
                        <button
                          type="button"
                          onClick={() => processExchange.mutate({ id: r.id, decision: 'rejected' })}
                          disabled={processExchange.isPending}
                          className="border border-kt-red/50 px-3 py-1.5 text-xs text-kt-red"
                        >
                          Refuser
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Section>
        </>
      ) : null}
    </div>
  )
}
