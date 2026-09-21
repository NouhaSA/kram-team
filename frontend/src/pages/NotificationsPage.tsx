import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notifications'
import { ApiError } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, Section } from '@/components/ui/DashboardBits'

function notificationCta(meta?: Record<string, unknown>, category?: string) {
  const type = typeof meta?.type === 'string' ? meta.type : ''

  if (type === 'eco_action_pending' || type === 'eco_redemption_pending') {
    return { to: '/app/green', label: 'Ouvrir Green' }
  }

  if (type === 'booking_pending') {
    return { to: '/app/bookings', label: 'Valider' }
  }

  if (
    category === 'schedule' ||
    category === 'booking' ||
    type.startsWith('slot_') ||
    meta?.schedule_slot_id != null
  ) {
    return { to: '/app/bookings', label: category === 'booking' ? 'Voir' : 'Réserver' }
  }

  if (category === 'green') {
    return { to: '/app/green', label: 'Voir Green' }
  }

  return null
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => listNotifications(false),
  })

  const markOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
      await queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
      await queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={(error as Error).message} />

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Inbox</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
            Notifications
          </h1>
        </div>
        <button
          type="button"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending || !data?.unread_count}
          className="border border-white/15 px-4 py-2 text-xs tracking-wide uppercase transition hover:border-kt-red disabled:opacity-40"
        >
          Tout marquer lu ({data?.unread_count ?? 0})
        </button>
      </div>

      <Section title="Récentes">
        {!data?.items.length ? (
          <EmptyState message="Aucune notification." />
        ) : (
          <ul className="divide-y divide-white/5 border border-white/8">
            {data.items.map((n) => {
              const unread = !n.read_at
              const cta = notificationCta(n.data.meta, n.data.category)
              return (
                <li
                  key={n.id}
                  className={`flex flex-wrap items-start justify-between gap-3 px-4 py-4 text-sm ${
                    unread ? 'bg-white/[0.03]' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {unread ? (
                        <span className="h-2 w-2 rounded-full bg-kt-red" />
                      ) : null}
                      <p className="font-medium text-white">
                        {n.data.title ?? 'Notification'}
                      </p>
                      {n.data.category_label ? (
                        <span className="text-xs tracking-wider text-kt-muted uppercase">
                          {n.data.category_label}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-kt-stone">{n.data.body}</p>
                    <p className="mt-2 text-xs text-kt-muted">
                      {new Date(n.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {cta ? (
                      <Link
                        to={cta.to}
                        className="bg-kt-red px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase transition hover:bg-kt-red-hot"
                      >
                        {cta.label}
                      </Link>
                    ) : null}
                    {unread ? (
                      <button
                        type="button"
                        onClick={() => markOne.mutate(n.id)}
                        disabled={markOne.isPending}
                        className="text-xs text-kt-stone underline hover:text-white"
                      >
                        Marquer lu
                      </button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      {markAll.error || markOne.error ? (
        <div className="mt-4">
          <ErrorState
            message={
              ((markAll.error || markOne.error) as ApiError)?.message ?? 'Erreur'
            }
          />
        </div>
      ) : null}
    </div>
  )
}
