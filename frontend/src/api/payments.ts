import { api } from '@/api/client'
import type { Paginated } from '@/types/api'

export type PaymentRecord = {
  id: number
  reference: string
  member_id: number
  subscription_id: number | null
  type: string
  type_label: string
  method: string
  method_label: string
  status: string
  status_label: string
  amount: string | number
  refunded_amount: string | number
  refundable_amount: number
  currency: string
  paid_at: string | null
  member?: {
    id: number
    user?: { first_name: string; last_name: string; email: string }
  }
}

export type PaymentSummary = {
  total_paid: number
  total_refunded: number
  pending: number
  count: number
  currency: string
}

function asList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data ?? []
}

export async function listPayments() {
  const payload = await api<Paginated<PaymentRecord> | PaymentRecord[]>('/payments')
  return asList(payload)
}

export const createPayment = (input: {
  member_id: number
  subscription_id?: number
  amount: number
  method: string
  type: string
  notes?: string
}) =>
  api<PaymentRecord>('/payments', {
    method: 'POST',
    body: JSON.stringify(input),
  })

export const refundPayment = (id: number, amount?: number, notes?: string) =>
  api<PaymentRecord>(`/payments/${id}/refund`, {
    method: 'POST',
    body: JSON.stringify({ amount, notes }),
  })
