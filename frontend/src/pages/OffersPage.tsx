import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { createOffer, listOffers, type OfferType, type QuotaType } from '@/api/offers'
import { ApiError } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, Section } from '@/components/ui/DashboardBits'
import { useAuth } from '@/auth/AuthContext'

type QuotaForm = {
  label: string
  quota_type: QuotaType
  total: string
  activity_type: string
}

const emptyQuota = (): QuotaForm => ({
  label: '',
  quota_type: 'sessions',
  total: '10',
  activity_type: '',
})

export function OffersPage() {
  const { hasRole } = useAuth()
  const canCreate = hasRole('admin')
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['offers'],
    queryFn: listOffers,
  })

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'sessions' as OfferType,
    price: '',
    duration_days: '30',
    requires_booking: true,
    promotion_percent: '',
    services_included: '',
    is_active: true,
  })
  const [quotas, setQuotas] = useState<QuotaForm[]>([emptyQuota()])
  const [formError, setFormError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () =>
      createOffer({
        name: form.name,
        description: form.description || undefined,
        type: form.type,
        price: Number(form.price),
        duration_days: form.duration_days ? Number(form.duration_days) : undefined,
        requires_booking: form.requires_booking,
        promotion_percent: form.promotion_percent ? Number(form.promotion_percent) : undefined,
        services_included: form.services_included
          ? form.services_included.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        is_active: form.is_active,
        quotas: quotas.map((q) => ({
          label: q.label,
          quota_type: q.quota_type,
          total: q.quota_type === 'unlimited' ? null : Number(q.total),
          activity_type: q.activity_type || null,
        })),
      }),
    onSuccess: async () => {
      setForm({
        name: '',
        description: '',
        type: 'sessions',
        price: '',
        duration_days: '30',
        requires_booking: true,
        promotion_percent: '',
        services_included: '',
        is_active: true,
      })
      setQuotas([emptyQuota()])
      setFormError(null)
      await queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Création impossible'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    create.mutate()
  }

  function updateQuota(index: number, patch: Partial<QuotaForm>) {
    setQuotas((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={(error as Error).message} />

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Catalogue</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-kt-cream uppercase">
        Offres
      </h1>

      {canCreate ? (
        <Section title="Nouvelle offre">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Nom de l’offre"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
                required
              />
              <select
                value={form.type}
                onChange={(e) => {
                  const type = e.target.value as OfferType
                  setForm((f) => ({ ...f, type }))
                  if (type === 'unlimited') {
                    setQuotas([{ label: 'Accès illimité', quota_type: 'unlimited', total: '', activity_type: '' }])
                  }
                }}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
              >
                <option value="unlimited">Illimitée</option>
                <option value="sessions">Par séances</option>
                <option value="hourly">Horaire</option>
                <option value="mixed">Mixte</option>
              </select>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Prix (TND)"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
                required
              />
              <input
                type="number"
                min={1}
                placeholder="Durée (jours)"
                value={form.duration_days}
                onChange={(e) => setForm((f) => ({ ...f, duration_days: e.target.value }))}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
              />
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Promo % (opt.)"
                value={form.promotion_percent}
                onChange={(e) => setForm((f) => ({ ...f, promotion_percent: e.target.value }))}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
              />
              <input
                placeholder="Services inclus (séparés par virgule)"
                value={form.services_included}
                onChange={(e) => setForm((f) => ({ ...f, services_included: e.target.value }))}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red sm:col-span-2"
                rows={2}
              />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-kt-stone">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.requires_booking}
                  onChange={(e) => setForm((f) => ({ ...f, requires_booking: e.target.checked }))}
                  className="accent-kt-red"
                />
                Réservation obligatoire
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="accent-kt-red"
                />
                Offre active
              </label>
            </div>

            <div className="space-y-3 border border-white/8 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Quotas / options</p>
                {form.type === 'mixed' || form.type === 'sessions' || form.type === 'hourly' ? (
                  <button
                    type="button"
                    onClick={() => setQuotas((rows) => [...rows, emptyQuota()])}
                    className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-kt-red"
                  >
                    + Quota
                  </button>
                ) : null}
              </div>

              {quotas.map((q, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-4">
                  <input
                    placeholder="Libellé"
                    value={q.label}
                    onChange={(e) => updateQuota(index, { label: e.target.value })}
                    className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
                    required
                  />
                  <select
                    value={q.quota_type}
                    onChange={(e) => updateQuota(index, { quota_type: e.target.value as QuotaType })}
                    className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
                  >
                    <option value="sessions">Séances</option>
                    <option value="hours">Heures</option>
                    <option value="unlimited">Illimité</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    placeholder="Quantité"
                    value={q.total}
                    disabled={q.quota_type === 'unlimited'}
                    onChange={(e) => updateQuota(index, { total: e.target.value })}
                    className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red disabled:opacity-40"
                    required={q.quota_type !== 'unlimited'}
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="Activité (opt.)"
                      value={q.activity_type}
                      onChange={(e) => updateQuota(index, { activity_type: e.target.value })}
                      className="w-full border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
                    />
                    {quotas.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setQuotas((rows) => rows.filter((_, i) => i !== index))}
                        className="border border-white/15 px-2 text-xs hover:border-kt-red"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {formError ? (
              <p className="border border-kt-red/40 bg-kt-red/10 px-3 py-2 text-sm">{formError}</p>
            ) : null}

            <button
              type="submit"
              disabled={create.isPending}
              className="bg-kt-red px-4 py-2 text-sm font-semibold text-white hover:bg-kt-red-hot disabled:opacity-60"
            >
              {create.isPending ? 'Création…' : 'Créer l’offre'}
            </button>
          </form>
        </Section>
      ) : null}

      <Section title={`${data?.length ?? 0} offres`}>
        {!data?.length ? (
          <EmptyState message="Aucune offre." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.map((offer) => (
              <article key={offer.id} className="border border-white/8 bg-white/[0.02] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-wider text-kt-red uppercase">{offer.type_label}</p>
                    <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-wide uppercase">
                      {offer.name}
                    </h3>
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-3xl text-kt-cream">
                    {offer.effective_price}
                    <span className="ml-1 text-sm text-kt-muted">TND</span>
                  </p>
                </div>
                {offer.description ? (
                  <p className="mt-3 text-sm text-kt-stone">{offer.description}</p>
                ) : null}
                {offer.duration_days ? (
                  <p className="mt-2 text-xs text-kt-muted">{offer.duration_days} jours</p>
                ) : null}
                {offer.quotas?.length ? (
                  <ul className="mt-4 space-y-1 border-t border-white/5 pt-3 text-sm text-kt-stone">
                    {offer.quotas.map((q) => (
                      <li key={q.id}>
                        {q.label}
                        {q.total != null ? ` · ${q.total}` : ' · illimité'}
                        {q.activity_type ? ` · ${q.activity_type}` : ''}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
