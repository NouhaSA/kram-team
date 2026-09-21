import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import {
  createStaff,
  listStaff,
  staffRoleLabel,
  updateStaff,
  type StaffRole,
} from '@/api/staff'
import { ApiError } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, Section } from '@/components/ui/DashboardBits'

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: 'password',
  role: 'coach' as StaffRole,
  hourly_rate: '35',
}

export function StaffAccountsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => listStaff(),
  })

  const [form, setForm] = useState(emptyForm)
  const [msg, setMsg] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () =>
      createStaff({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
        hourly_rate:
          form.role === 'coach' && form.hourly_rate
            ? Number(form.hourly_rate)
            : undefined,
      }),
    onSuccess: async () => {
      setForm(emptyForm)
      setFormError(null)
      setMsg('Compte créé.')
      await queryClient.invalidateQueries({ queryKey: ['admin-staff'] })
      await queryClient.invalidateQueries({ queryKey: ['staff-coaches'] })
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Création impossible'),
  })

  const toggle = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      updateStaff(id, { is_active }),
    onSuccess: async () => {
      setMsg('Statut mis à jour.')
      await queryClient.invalidateQueries({ queryKey: ['admin-staff'] })
      await queryClient.invalidateQueries({ queryKey: ['staff-coaches'] })
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Mise à jour impossible'),
  })

  const setRate = useMutation({
    mutationFn: ({ id, hourly_rate }: { id: number; hourly_rate: number }) =>
      updateStaff(id, { hourly_rate }),
    onSuccess: async () => {
      setMsg('Taux horaire mis à jour.')
      await queryClient.invalidateQueries({ queryKey: ['admin-staff'] })
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Mise à jour impossible'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    create.mutate()
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={(error as Error).message} />

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Administration</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Comptes staff
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-kt-stone">
        Crée des comptes Gestionnaire (réception) ou Coach. Les gestionnaires peuvent assigner un
        coach à chaque créneau et gérer le planning.
      </p>

      {msg ? (
        <p className="mt-4 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {msg}
        </p>
      ) : null}
      {formError ? (
        <div className="mt-4">
          <ErrorState message={formError} />
        </div>
      ) : null}

      <Section title="Nouveau compte">
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Prénom"
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            required
          />
          <input
            placeholder="Nom"
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            required
          />
          <input
            placeholder="Téléphone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as StaffRole }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          >
            <option value="coach">Coach</option>
            <option value="reception">Gestionnaire</option>
          </select>
          {form.role === 'coach' ? (
            <input
              type="number"
              min={0}
              step={0.5}
              placeholder="Taux horaire (TND)"
              value={form.hourly_rate}
              onChange={(e) => setForm((f) => ({ ...f, hourly_rate: e.target.value }))}
              className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            />
          ) : null}
          <button
            type="submit"
            disabled={create.isPending}
            className="bg-kt-red px-4 py-2 text-sm font-semibold text-white hover:bg-kt-red-hot disabled:opacity-60 sm:col-span-2"
          >
            {create.isPending ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
      </Section>

      <Section title="Équipe">
        {!data?.length ? (
          <EmptyState message="Aucun compte staff." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {data.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {u.full_name || `${u.first_name} ${u.last_name}`}
                  </p>
                  <p className="text-kt-stone">
                    {u.email} · {staffRoleLabel(u.roles)}
                    {u.roles?.includes('coach')
                      ? ` · ${u.hourly_rate ?? 35} ${u.currency ?? 'TND'}/h`
                      : ''}
                    {!u.is_active ? ' · inactif' : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {u.roles?.includes('coach') ? (
                    <button
                      type="button"
                      onClick={() => {
                        const raw = window.prompt(
                          'Taux horaire (TND)',
                          String(u.hourly_rate ?? 35),
                        )
                        if (raw == null || raw === '') return
                        const rate = Number(raw)
                        if (Number.isNaN(rate) || rate < 0) {
                          setFormError('Taux invalide')
                          return
                        }
                        setRate.mutate({ id: u.id, hourly_rate: rate })
                      }}
                      disabled={setRate.isPending}
                      className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-kt-red"
                    >
                      Taux
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => toggle.mutate({ id: u.id, is_active: !u.is_active })}
                    disabled={toggle.isPending}
                    className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-kt-red"
                  >
                    {u.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
