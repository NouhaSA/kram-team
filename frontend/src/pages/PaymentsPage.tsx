import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { createPayment, listPayments, refundPayment } from '@/api/payments'
import { listMembers } from '@/api/members'
import { ApiError } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, Section } from '@/components/ui/DashboardBits'

export function PaymentsPage() {
  const queryClient = useQueryClient()
  const paymentsQuery = useQuery({ queryKey: ['payments'], queryFn: listPayments })
  const membersQuery = useQuery({ queryKey: ['members'], queryFn: listMembers })

  const [form, setForm] = useState({
    member_id: '',
    amount: '',
    method: 'cash',
    type: 'subscription',
    notes: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () =>
      createPayment({
        member_id: Number(form.member_id),
        amount: Number(form.amount),
        method: form.method,
        type: form.type,
        notes: form.notes || undefined,
      }),
    onSuccess: async () => {
      setMessage('Paiement enregistré.')
      setError(null)
      setForm((f) => ({ ...f, amount: '', notes: '' }))
      await queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Erreur'),
  })

  const refund = useMutation({
    mutationFn: (id: number) => refundPayment(id),
    onSuccess: async () => {
      setMessage('Remboursement effectué.')
      await queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Erreur'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    create.mutate()
  }

  if (paymentsQuery.isLoading) return <LoadingState />
  if (paymentsQuery.error) {
    return <ErrorState message={(paymentsQuery.error as Error).message} />
  }

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Finance</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Paiements
      </h1>

      {message ? (
        <p className="mt-4 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}
      {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}

      <Section title="Enregistrer">
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <select
            value={form.member_id}
            onChange={(e) => setForm((f) => ({ ...f, member_id: e.target.value }))}
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
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Montant TND"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            required
          />
          <select
            value={form.method}
            onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          >
            <option value="cash">Espèces</option>
            <option value="card">Carte</option>
            <option value="transfer">Virement</option>
            <option value="check">Chèque</option>
            <option value="online">En ligne</option>
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
          >
            <option value="subscription">Abonnement</option>
            <option value="renewal">Renouvellement</option>
            <option value="booking">Réservation</option>
            <option value="product">Produit</option>
            <option value="other">Autre</option>
          </select>
          <input
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red sm:col-span-2"
          />
          <button
            type="submit"
            disabled={create.isPending}
            className="bg-kt-red px-4 py-2 text-sm font-semibold text-white hover:bg-kt-red-hot disabled:opacity-60 sm:col-span-2"
          >
            {create.isPending ? 'Enregistrement…' : 'Enregistrer le paiement'}
          </button>
        </form>
      </Section>

      <Section title={`Historique (${paymentsQuery.data?.length ?? 0})`}>
        {!paymentsQuery.data?.length ? (
          <EmptyState message="Aucun paiement." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {paymentsQuery.data.map((p) => {
              const name = p.member?.user
                ? `${p.member.user.first_name} ${p.member.user.last_name}`
                : `Membre #${p.member_id}`
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="font-mono text-xs text-kt-muted">{p.reference}</p>
                    <p className="text-kt-stone">
                      {p.type_label} · {p.method_label} · {p.status_label}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-[family-name:var(--font-display)] text-2xl text-white">
                      {p.amount} <span className="text-sm text-kt-muted">{p.currency}</span>
                    </p>
                    {p.status === 'completed' || p.status === 'partially_refunded' ? (
                      <button
                        type="button"
                        onClick={() => refund.mutate(p.id)}
                        className="mt-1 text-xs text-kt-stone underline hover:text-kt-red"
                      >
                        Rembourser
                      </button>
                    ) : null}
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
