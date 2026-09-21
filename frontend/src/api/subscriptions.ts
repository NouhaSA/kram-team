import { api } from '@/api/client'
import type { Paginated } from '@/types/api'

export type SubscriptionRecord = {
  id: number
  member_id: number
  offer_id: number
  status: string
  status_label: string
  price_paid: string | number
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  notes: string | null
  member?: {
    id: number
    user?: { first_name: string; last_name: string; email: string }
  }
  offer?: { id: number; name: string; type?: string; requires_booking?: boolean }
  quotas?: {
    id: number
    label: string
    remaining: number | null
    total: number | null
    consumed: number
    is_unlimited: boolean
  }[]
}

function asList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data ?? []
}

export async function listSubscriptions(memberId?: number) {
  const qs = memberId ? `?member_id=${memberId}` : ''
  const payload = await api<Paginated<SubscriptionRecord> | SubscriptionRecord[]>(
    `/subscriptions${qs}`,
  )
  return asList(payload)
}

export async function listActiveSubscriptions(memberId: number) {
  const payload = await api<Paginated<SubscriptionRecord> | SubscriptionRecord[]>(
    `/members/${memberId}/active-subscriptions`,
  )
  return asList(payload)
}

export const createSubscription = (input: {
  member_id: number
  offer_id: number
  price_paid?: number
  notes?: string
}) =>
  api<SubscriptionRecord>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(input),
  })

export const suspendSubscription = (id: number, notes?: string) =>
  api<SubscriptionRecord>(`/subscriptions/${id}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })

export const activateSubscription = (id: number) =>
  api<SubscriptionRecord>(`/subscriptions/${id}/activate`, {
    method: 'POST',
    body: '{}',
  })

export const cancelSubscription = (id: number, notes?: string) =>
  api<SubscriptionRecord>(`/subscriptions/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })

export const renewSubscription = (id: number) =>
  api<SubscriptionRecord>(`/subscriptions/${id}/renew`, {
    method: 'POST',
    body: '{}',
  })
