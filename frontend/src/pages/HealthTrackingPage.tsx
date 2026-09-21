import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import {
  addHealthEntry,
  getMemberHealth,
  getMyHealth,
  updateHealthProfile,
  type HealthGoal,
  type HealthOverview,
} from '@/api/health'
import { listMembers } from '@/api/members'
import { ApiError } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, Section, StatCard } from '@/components/ui/DashboardBits'
import { useAuth } from '@/auth/AuthContext'

export function HealthTrackingPage() {
  const { user, hasRole } = useAuth()
  const queryClient = useQueryClient()
  const canPickMember = hasRole('admin', 'reception', 'coach')
  const myMemberId = user?.member?.id ?? null

  const [memberId, setMemberId] = useState<string>('')

  useEffect(() => {
    if (!canPickMember && myMemberId) {
      setMemberId(String(myMemberId))
    }
  }, [canPickMember, myMemberId])

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: listMembers,
    enabled: canPickMember,
  })

  const effectiveId = memberId ? Number(memberId) : myMemberId

  const healthQuery = useQuery({
    queryKey: ['health', effectiveId],
    queryFn: () => {
      if (effectiveId && canPickMember) return getMemberHealth(effectiveId)
      return getMyHealth()
    },
    enabled: canPickMember ? Boolean(effectiveId) : Boolean(myMemberId),
  })

  const [profileForm, setProfileForm] = useState({
    height_cm: '170',
    goal: 'lose_weight' as HealthGoal,
    start_weight_kg: '',
    target_weight_kg: '',
    activity_level: '3',
    notes: '',
  })
  const [entryForm, setEntryForm] = useState({
    weight_kg: '',
    body_fat_percent: '',
    waist_cm: '',
    notes: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const data = healthQuery.data
    if (!data?.profile) return
    setProfileForm({
      height_cm: String(data.profile.height_cm),
      goal: data.profile.goal,
      start_weight_kg: data.profile.start_weight_kg != null ? String(data.profile.start_weight_kg) : '',
      target_weight_kg:
        data.profile.target_weight_kg != null ? String(data.profile.target_weight_kg) : '',
      activity_level: String(data.profile.activity_level),
      notes: data.profile.notes ?? '',
    })
  }, [healthQuery.data])

  const saveProfile = useMutation({
    mutationFn: (id: number) =>
      updateHealthProfile(id, {
        height_cm: Number(profileForm.height_cm),
        goal: profileForm.goal,
        start_weight_kg: profileForm.start_weight_kg
          ? Number(profileForm.start_weight_kg)
          : undefined,
        target_weight_kg: profileForm.target_weight_kg
          ? Number(profileForm.target_weight_kg)
          : undefined,
        activity_level: Number(profileForm.activity_level),
        notes: profileForm.notes || undefined,
      }),
    onSuccess: async () => {
      setFormError(null)
      await queryClient.invalidateQueries({ queryKey: ['health'] })
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Erreur profil'),
  })

  const saveEntry = useMutation({
    mutationFn: (id: number) =>
      addHealthEntry(id, {
        weight_kg: Number(entryForm.weight_kg),
        body_fat_percent: entryForm.body_fat_percent
          ? Number(entryForm.body_fat_percent)
          : undefined,
        waist_cm: entryForm.waist_cm ? Number(entryForm.waist_cm) : undefined,
        notes: entryForm.notes || undefined,
      }),
    onSuccess: async () => {
      setEntryForm({ weight_kg: '', body_fat_percent: '', waist_cm: '', notes: '' })
      setFormError(null)
      await queryClient.invalidateQueries({ queryKey: ['health'] })
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Erreur saisie'),
  })

  if (!canPickMember && !myMemberId) {
    return (
      <ErrorState message="Aucun profil adhérent lié à ce compte. Demande à la réception de créer ta fiche." />
    )
  }

  if (canPickMember && !effectiveId) {
    return (
      <div>
        <Header />
        <Section title="Choisir un adhérent">
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red sm:max-w-md"
          >
            <option value="">Adhérent…</option>
            {(membersQuery.data ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                #{m.id} · {m.user ? `${m.user.first_name} ${m.user.last_name}` : 'Membre'}
              </option>
            ))}
          </select>
        </Section>
      </div>
    )
  }

  if (healthQuery.isLoading) return <LoadingState />
  if (healthQuery.error || !healthQuery.data) {
    return <ErrorState message={(healthQuery.error as Error)?.message ?? 'Erreur'} />
  }

  const data = healthQuery.data
  const id = data.member.id

  return (
    <div>
      <Header name={data.member.full_name} />

      {canPickMember ? (
        <div className="mt-4">
          <select
            value={String(id)}
            onChange={(e) => setMemberId(e.target.value)}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          >
            {(membersQuery.data ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                #{m.id} · {m.user ? `${m.user.first_name} ${m.user.last_name}` : 'Membre'}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <Metrics data={data} />

      <Section title="Profil & objectifs">
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            saveProfile.mutate(id)
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-kt-muted uppercase">Taille (cm)</span>
            <input
              type="number"
              step="0.1"
              value={profileForm.height_cm}
              onChange={(e) => setProfileForm((f) => ({ ...f, height_cm: e.target.value }))}
              className="w-full border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-kt-red"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-kt-muted uppercase">Objectif</span>
            <select
              value={profileForm.goal}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, goal: e.target.value as HealthGoal }))
              }
              className="w-full border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-kt-red"
            >
              <option value="lose_weight">Perte de poids</option>
              <option value="gain_weight">Prise de masse</option>
              <option value="maintain">Maintien</option>
              <option value="recomposition">Recomposition</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-kt-muted uppercase">Poids départ (kg)</span>
            <input
              type="number"
              step="0.1"
              value={profileForm.start_weight_kg}
              onChange={(e) => setProfileForm((f) => ({ ...f, start_weight_kg: e.target.value }))}
              className="w-full border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-kt-red"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-kt-muted uppercase">Poids cible (kg)</span>
            <input
              type="number"
              step="0.1"
              value={profileForm.target_weight_kg}
              onChange={(e) => setProfileForm((f) => ({ ...f, target_weight_kg: e.target.value }))}
              className="w-full border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-kt-red"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-xs text-kt-muted uppercase">Activité (1–5)</span>
            <input
              type="number"
              min={1}
              max={5}
              value={profileForm.activity_level}
              onChange={(e) => setProfileForm((f) => ({ ...f, activity_level: e.target.value }))}
              className="w-full border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-kt-red sm:max-w-xs"
            />
          </label>
          <button
            type="submit"
            disabled={saveProfile.isPending}
            className="bg-kt-red px-4 py-2 text-sm font-semibold text-white hover:bg-kt-red-hot disabled:opacity-60 sm:col-span-2"
          >
            {saveProfile.isPending ? 'Enregistrement…' : 'Enregistrer le profil'}
          </button>
        </form>
      </Section>

      <Section title="Nouvelle saisie">
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            saveEntry.mutate(id)
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <input
            type="number"
            step="0.1"
            required
            placeholder="Poids (kg)"
            value={entryForm.weight_kg}
            onChange={(e) => setEntryForm((f) => ({ ...f, weight_kg: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          />
          <input
            type="number"
            step="0.1"
            placeholder="% graisse (opt.)"
            value={entryForm.body_fat_percent}
            onChange={(e) => setEntryForm((f) => ({ ...f, body_fat_percent: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Tour de taille cm (opt.)"
            value={entryForm.waist_cm}
            onChange={(e) => setEntryForm((f) => ({ ...f, waist_cm: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          />
          <input
            placeholder="Notes"
            value={entryForm.notes}
            onChange={(e) => setEntryForm((f) => ({ ...f, notes: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          />
          <button
            type="submit"
            disabled={saveEntry.isPending}
            className="border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-kt-red hover:bg-kt-red sm:col-span-2"
          >
            {saveEntry.isPending ? 'Saisie…' : 'Ajouter la mesure'}
          </button>
        </form>
      </Section>

      {formError ? <p className="mt-4 border border-kt-red/40 bg-kt-red/10 px-3 py-2 text-sm">{formError}</p> : null}

      <Section title="Recommandations">
        <ul className="space-y-2 text-sm text-kt-stone">
          {data.recommendations.map((tip) => (
            <li key={tip} className="border-l-2 border-kt-red pl-3">
              {tip}
            </li>
          ))}
        </ul>
        {data.nutrition.calorie_target ? (
          <p className="mt-4 text-sm text-kt-muted">
            BMR {data.nutrition.bmr} · TDEE {data.nutrition.tdee} · Cible {data.nutrition.calorie_target}{' '}
            kcal · Protéines ~{data.nutrition.protein_g} g
          </p>
        ) : (
          <p className="mt-4 text-sm text-kt-muted">{data.nutrition.note}</p>
        )}
      </Section>

      <Section title={`Historique (${data.entries_count})`}>
        {!data.history.length ? (
          <EmptyState message="Aucune mesure. Ajoute le premier poids pour démarrer le parcours." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {[...data.history].reverse().map((h) => (
              <li key={h.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{h.weight_kg} kg</p>
                  <p className="text-kt-stone">
                    {h.recorded_at ? new Date(h.recorded_at).toLocaleString('fr-FR') : '—'}
                    {h.bmi != null ? ` · IMC ${h.bmi}` : ''}
                  </p>
                </div>
                <p className="text-xs text-kt-muted">{h.recorded_by ?? ''}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Header({ name }: { name?: string | null }) {
  return (
    <>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Parcours</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Suivi santé
      </h1>
      {name ? <p className="mt-2 text-kt-stone">{name}</p> : null}
    </>
  )
}

function Metrics({ data }: { data: HealthOverview }) {
  const m = data.metrics
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Poids actuel" value={m.current_weight_kg != null ? `${m.current_weight_kg} kg` : '—'} />
      <StatCard label="IMC" value={m.bmi != null ? `${m.bmi}` : '—'} />
      <StatCard
        label="Avancement"
        value={m.progress_percent != null ? `${m.progress_percent}%` : '—'}
      />
      <StatCard
        label="Évolution"
        value={m.delta_kg != null ? `${m.delta_kg > 0 ? '+' : ''}${m.delta_kg} kg` : '—'}
      />
      <div className="sm:col-span-2 lg:col-span-4 border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-kt-stone">
        {m.bmi_category ? <span>{m.bmi_category}</span> : null}
        {m.ideal_weight_min_kg != null && m.ideal_weight_max_kg != null ? (
          <span>
            {m.bmi_category ? ' · ' : ''}
            Poids idéal {m.ideal_weight_min_kg}–{m.ideal_weight_max_kg} kg
            {m.ideal_weight_kg != null ? ` (réf. ${m.ideal_weight_kg} kg)` : ''}
          </span>
        ) : null}
        {m.target_weight_kg != null ? (
          <span>
            {' '}
            · Cible {m.target_weight_kg} kg
            {m.remaining_kg != null ? ` (reste ${m.remaining_kg} kg)` : ''}
          </span>
        ) : null}
      </div>
    </div>
  )
}
