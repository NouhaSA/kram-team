import { api } from '@/api/client'
import type { BookingRecord, Paginated, ScheduleSlotRecord } from '@/types/api'

function asList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data ?? []
}

export async function listSlots() {
  const payload = await api<Paginated<ScheduleSlotRecord> | ScheduleSlotRecord[]>('/schedule-slots')
  return asList(payload)
}

export async function listBookings(params?: { member_id?: number; per_page?: number }) {
  const search = new URLSearchParams()
  if (params?.member_id) search.set('member_id', String(params.member_id))
  search.set('per_page', String(params?.per_page ?? 50))
  const qs = search.toString()
  const payload = await api<Paginated<BookingRecord> | BookingRecord[]>(`/bookings?${qs}`)
  return asList(payload)
}

export async function createBooking(
  schedule_slot_id: number,
  member_id: number,
  subscription_id: number,
) {
  return api<BookingRecord>('/bookings', {
    method: 'POST',
    body: JSON.stringify({ schedule_slot_id, member_id, subscription_id }),
  })
}

export async function cancelBooking(id: number, reason?: string) {
  return api<BookingRecord>(`/bookings/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export async function acceptBooking(id: number) {
  return api<BookingRecord>(`/bookings/${id}/accept`, {
    method: 'POST',
    body: '{}',
  })
}
