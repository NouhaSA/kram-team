import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { createMember, listMembers } from '@/api/members'
import { ApiError } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, Section } from '@/components/ui/DashboardBits'
import { useAuth } from '@/auth/AuthContext'

export function MembersPage() {
  const { hasRole } = useAuth()
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: listMembers,
  })

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: 'password',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: createMember,
    onSuccess: async () => {
      setForm({ first_name: '', last_name: '', email: '', phone: '', password: 'password' })
      setFormError(null)
      await queryClient.invalidateQueries({ queryKey: ['members'] })
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'Erreur création')
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    create.mutate({
      ...form,
      phone: form.phone || undefined,
    })
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={(error as Error).message} />

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">CRM</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-kt-cream uppercase">
        Adhérents
      </h1>

      {hasRole('admin', 'reception') ? (
        <Section title="Nouvel adhérent">
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
              className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red sm:col-span-2"
              required
              minLength={8}
            />
            {formError ? (
              <p className="sm:col-span-2 border border-kt-red/40 bg-kt-red/10 px-3 py-2 text-sm">{formError}</p>
            ) : null}
            <button
              type="submit"
              disabled={create.isPending}
              className="bg-kt-red px-4 py-2 text-sm font-semibold text-white hover:bg-kt-red-hot disabled:opacity-60 sm:col-span-2"
            >
              {create.isPending ? 'Création…' : 'Créer adhérent'}
            </button>
          </form>
        </Section>
      ) : null}

      <Section title={`Liste (${data?.length ?? 0})`}>
        {!data?.length ? (
          <EmptyState message="Aucun adhérent." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {data.map((m) => {
              const name = m.user
                ? `${m.user.first_name} ${m.user.last_name}`
                : `Membre #${m.id}`
              return (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-kt-stone">{m.user?.email}</p>
                    <p className="mt-1 font-mono text-xs text-kt-muted">{m.qr_uuid}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-kt-stone">
                      <p className={m.is_active ? 'text-emerald-400' : 'text-kt-red'}>
                        {m.is_active ? 'Actif' : 'Inactif'}
                      </p>
                      <p>{m.eco_points} eco pts</p>
                    </div>
                    <Link
                      to={`/app/members/${m.id}/stats`}
                      className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-kt-red hover:text-kt-cream"
                    >
                      Stats
                    </Link>
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
