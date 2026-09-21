import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { cancelBooking, createBooking, acceptBooking, listBookings, listSlots } from '@/api/bookings'
import { listMembers } from '@/api/members'
import { listActiveSubscriptions } from '@/api/subscriptions'
import { ApiError } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, Section } from '@/components/ui/DashboardBits'
import { useAuth } from '@/auth/AuthContext'
import type { BookingRecord } from '@/types/api'

export function BookingsPage() {
  const { hasRole, user } = useAuth()
  const queryClient = useQueryClient()
  const canManage = hasRole('admin', 'reception', 'coach')
  const canModerate = hasRole('admin', 'reception')
  const memberIdSelf = user?.member?.id

  const slotsQuery = useQuery({ queryKey: ['schedule-slots'], queryFn: listSlots })
  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => listBookings({ per_page: 50 }),
  })
  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: listMembers,
    enabled: canManage,
  })

  const [slotId, setSlotId] = useState('')
  const [memberId, setMemberId] = useState('')
  const [subscriptionId, setSubscriptionId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [bookingMsg, setBookingMsg] = useState<string | null>(null)

  const targetMemberId = canManage
    ? memberId
      ? Number(memberId)
      : undefined
    : memberIdSelf

  const subsQuery = useQuery({
    queryKey: ['active-subscriptions', targetMemberId],
    queryFn: () => listActiveSubscriptions(targetMemberId!),
    enabled: !!targetMemberId,
  })

  const bookableSubs = useMemo(
    () =>
      (subsQuery.data ?? []).filter(
        (s) => s.offer?.requires_booking !== false,
      ),
    [subsQuery.data],
  )

  useEffect(() => {
    setSubscriptionId('')
  }, [targetMemberId])

  useEffect(() => {
    if (bookableSubs.length === 1 && !subscriptionId) {
      setSubscriptionId(String(bookableSubs[0].id))
    }
  }, [bookableSubs, subscriptionId])

  const bookableSlots = useMemo(
    () => (slotsQuery.data ?? []).filter((s) => s.is_bookable || s.status === 'full'),
    [slotsQuery.data],
  )

  const invalidateBookingData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['bookings'] }),
      queryClient.invalidateQueries({ queryKey: ['schedule-slots'] }),
    ])
  }

  const create = useMutation({
    mutationFn: () =>
      createBooking(Number(slotId), Number(memberId), Number(subscriptionId)),
    onSuccess: async () => {
      setFormError(null)
      setBookingMsg(
        canModerate
          ? 'Réservation enregistrée.'
          : 'Demande envoyée — en attente de validation.',
      )
      setSlotId('')
      setMemberId('')
      setSubscriptionId('')
      await invalidateBookingData()
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Réservation impossible'),
  })

  const bookSelf = useMutation({
    mutationFn: (scheduleSlotId: number) => {
      if (!memberIdSelf) {
        throw new ApiError('Compte adhérent requis pour réserver.', 422)
      }
      if (!subscriptionId) {
        throw new ApiError('Choisis un type d’abonnement pour réserver.', 422)
      }
      return createBooking(scheduleSlotId, memberIdSelf, Number(subscriptionId))
    },
    onSuccess: async () => {
      setBookingMsg('Demande envoyée — en attente de validation gestionnaire/admin.')
      setFormError(null)
      await invalidateBookingData()
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Réservation impossible'),
  })

  const cancel = useMutation({
    mutationFn: (id: number) => cancelBooking(id),
    onSuccess: async () => {
      setBookingMsg('Réservation annulée.')
      await invalidateBookingData()
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Annulation impossible'),
  })

  const accept = useMutation({
    mutationFn: (id: number) => acceptBooking(id),
    onSuccess: async () => {
      setBookingMsg('Réservation acceptée.')
      setFormError(null)
      await invalidateBookingData()
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Acceptation impossible'),
  })

  const pendingBookings = useMemo(
    () => (bookingsQuery.data ?? []).filter((b) => b.status === 'pending'),
    [bookingsQuery.data],
  )
  const otherBookings = useMemo(
    () => (bookingsQuery.data ?? []).filter((b) => b.status !== 'pending'),
    [bookingsQuery.data],
  )

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    create.mutate()
  }

  function renderBookingRow(b: BookingRecord) {
    const memberName =
      b.member && 'user' in b.member && b.member.user
        ? `${b.member.user.first_name} ${b.member.user.last_name}`
        : `Booking #${b.id}`
    const isOwner =
      !!memberIdSelf &&
      (b.member_id === memberIdSelf ||
        (b.member && 'id' in b.member && b.member.id === memberIdSelf))
    const canCancel =
      (canModerate || isOwner) &&
      (b.status === 'pending' || b.status === 'confirmed' || b.status === 'waitlist')

    return (
      <li
        key={b.id}
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm ${
          b.status === 'pending' ? 'bg-amber-500/5' : ''
        }`}
      >
        <div>
          <p className="font-medium">{memberName}</p>
          <p className="text-kt-stone">
            {b.schedule_slot?.course?.name ?? 'Cours'}
            {b.schedule_slot?.starts_at
              ? ` · ${new Date(b.schedule_slot.starts_at).toLocaleString('fr-FR')}`
              : ''}
          </p>
          <p className="mt-1 text-xs tracking-wide text-kt-muted uppercase">
            {b.status_label}
            {b.subscription?.offer?.name ? ` · ${b.subscription.offer.name}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canModerate && b.status === 'pending' ? (
            <button
              type="button"
              onClick={() => {
                setFormError(null)
                accept.mutate(b.id)
              }}
              disabled={accept.isPending}
              className="bg-emerald-600 px-4 py-2 text-xs font-semibold tracking-wide text-white uppercase transition hover:bg-emerald-500 disabled:opacity-40"
            >
              Accepter
            </button>
          ) : null}
          {canCancel ? (
            <button
              type="button"
              onClick={() => {
                setFormError(null)
                cancel.mutate(b.id)
              }}
              disabled={cancel.isPending}
              className="border border-kt-red/60 px-4 py-2 text-xs font-semibold tracking-wide text-kt-red uppercase transition hover:bg-kt-red/10 disabled:opacity-40"
            >
              Annuler
            </button>
          ) : null}
        </div>
      </li>
    )
  }

  if (slotsQuery.isLoading || bookingsQuery.isLoading) return <LoadingState />
  if (slotsQuery.error || bookingsQuery.error) {
    return (
      <ErrorState
        message={
          (slotsQuery.error as Error)?.message ??
          (bookingsQuery.error as Error)?.message ??
          'Erreur'
        }
      />
    )
  }

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Planning</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Réservations
      </h1>

      {canModerate ? (
        <p className="mt-3 text-sm text-kt-stone">
          En tant qu’admin/gestionnaire : valide les demandes avec <strong>Accepter</strong> ou{' '}
          <strong>Annuler</strong>.
          {pendingBookings.length
            ? ` ${pendingBookings.length} demande(s) en attente.`
            : ' Aucune demande en attente pour le moment.'}
        </p>
      ) : null}

      {bookingMsg ? (
        <p className="mt-4 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {bookingMsg}
        </p>
      ) : null}
      {formError ? (
        <div className="mt-4">
          <ErrorState message={formError} />
        </div>
      ) : null}

      {canModerate ? (
        <Section title={`À valider (${pendingBookings.length})`}>
          {!pendingBookings.length ? (
            <EmptyState message="Aucune réservation en attente. Demande à un adhérent (member@…) de réserver un créneau." />
          ) : (
            <ul className="divide-y divide-white/5 border border-amber-500/30">
              {pendingBookings.map((b) => renderBookingRow(b))}
            </ul>
          )}
        </Section>
      ) : null}

      {!canManage && memberIdSelf ? (
        <Section title="Abonnement pour réserver">
          {!bookableSubs.length ? (
            <EmptyState message="Aucun abonnement actif permettant une réservation." />
          ) : (
            <select
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              className="w-full border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red sm:max-w-md"
              required
            >
              <option value="">Type d’abonnement…</option>
              {bookableSubs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.offer?.name ?? `Abonnement #${s.id}`}
                  {s.offer?.type ? ` · ${s.offer.type}` : ''}
                </option>
              ))}
            </select>
          )}
        </Section>
      ) : null}

      <Section title="Créneaux">
        {!bookableSlots.length ? (
          <EmptyState message="Aucun créneau disponible." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {bookableSlots.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{s.course?.name ?? `Créneau #${s.id}`}</p>
                  <p className="text-kt-stone">
                    {new Date(s.starts_at).toLocaleString('fr-FR')}
                    {s.room?.name ? ` · ${s.room.name}` : ''}
                    {s.coach?.full_name ? ` · ${s.coach.full_name}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <p className={s.is_full ? 'text-kt-red' : 'text-emerald-400'}>
                      {s.booked_count}/{s.capacity} · {s.status_label}
                    </p>
                    {s.waitlist_count > 0 ? (
                      <p className="text-xs text-kt-muted">Waitlist {s.waitlist_count}</p>
                    ) : null}
                  </div>
                  {memberIdSelf && !canManage ? (
                    <button
                      type="button"
                      onClick={() => {
                        setBookingMsg(null)
                        setFormError(null)
                        bookSelf.mutate(s.id)
                      }}
                      disabled={
                        bookSelf.isPending ||
                        !subscriptionId ||
                        (!s.is_bookable && s.status !== 'full')
                      }
                      className="bg-kt-red px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase transition hover:bg-kt-red-hot disabled:opacity-40"
                    >
                      {bookSelf.isPending ? '…' : 'Réserver'}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        {!memberIdSelf && !canManage ? (
          <p className="mt-3 text-xs text-kt-muted">
            Connecte-toi avec un compte adhérent pour réserver un créneau.
          </p>
        ) : null}
      </Section>

      {canManage ? (
        <Section title="Nouvelle réservation">
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <select
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
              required
            >
              <option value="">Créneau…</option>
              {bookableSlots.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.id} · {s.course?.name} · {new Date(s.starts_at).toLocaleString('fr-FR')}
                </option>
              ))}
            </select>
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
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red sm:col-span-2"
              required
              disabled={!targetMemberId}
            >
              <option value="">
                {!targetMemberId
                  ? 'Choisir un adhérent d’abord…'
                  : subsQuery.isLoading
                    ? 'Chargement abonnements…'
                    : 'Type d’abonnement…'}
              </option>
              {bookableSubs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.offer?.name ?? `Abonnement #${s.id}`}
                  {s.offer?.type ? ` · ${s.offer.type}` : ''}
                </option>
              ))}
            </select>
            {targetMemberId && !subsQuery.isLoading && !bookableSubs.length ? (
              <p className="sm:col-span-2 text-sm text-kt-muted">
                Cet adhérent n’a pas d’abonnement actif permettant une réservation.
              </p>
            ) : null}
            {formError ? (
              <p className="sm:col-span-2 border border-kt-red/40 bg-kt-red/10 px-3 py-2 text-sm">{formError}</p>
            ) : null}
            <button
              type="submit"
              disabled={create.isPending || !subscriptionId}
              className="bg-kt-red px-4 py-2 text-sm font-semibold text-white hover:bg-kt-red-hot disabled:opacity-60 sm:col-span-2"
            >
              {create.isPending ? 'Réservation…' : 'Réserver'}
            </button>
          </form>
        </Section>
      ) : null}

      <Section title="Toutes les réservations">
        {!otherBookings.length && !pendingBookings.length ? (
          <EmptyState message="Aucune réservation." />
        ) : !otherBookings.length ? (
          <EmptyState message="Pas d’autres réservations hors demandes en attente." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {otherBookings.map((b) => renderBookingRow(b))}
          </ul>
        )}
      </Section>
    </div>
  )
}
