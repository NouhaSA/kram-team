import { api } from '@/api/client'
import type { OfferRecord, Paginated } from '@/types/api'

export type OfferType = 'unlimited' | 'sessions' | 'hourly' | 'mixed'
export type QuotaType = 'sessions' | 'hours' | 'unlimited'

export type CreateOfferPayload = {
  name: string
  description?: string
  type: OfferType
  price: number
  duration_days?: number
  requires_booking?: boolean
  promotion_percent?: number
  services_included?: string[]
  is_active?: boolean
  quotas: {
    label: string
    quota_type: QuotaType
    total?: number | null
    activity_type?: string | null
  }[]
}

function asList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data ?? []
}

export async function listOffers() {
  const payload = await api<Paginated<OfferRecord> | OfferRecord[]>('/offers')
  return asList(payload)
}

export async function createOffer(payload: CreateOfferPayload) {
  return api<OfferRecord>('/offers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
