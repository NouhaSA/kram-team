import { api } from '@/api/client'
import type { Paginated, ScheduleSlotRecord } from '@/types/api'

export type CourseRecord = {
  id: number
  name: string
  slug: string
  activity_type: string
  description: string | null
  level: string
  level_label: string
  default_duration_minutes: number
  default_capacity: number
  requires_booking: boolean
  is_active: boolean
}

export type RoomRecord = {
  id: number
  name: string
  slug: string
  capacity: number
  description: string | null
  is_active: boolean
}

function asList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data ?? []
}

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export async function listPublicSlots(params?: { from?: string; to?: string; course_id?: number }) {
  const payload = await api<Paginated<ScheduleSlotRecord> | ScheduleSlotRecord[]>(
    `/public/schedule-slots${qs({
      from: params?.from,
      to: params?.to,
      course_id: params?.course_id,
      per_page: 100,
    })}`,
  )
  return asList(payload)
}

export async function listPublicCourses() {
  const payload = await api<Paginated<CourseRecord> | CourseRecord[]>(
    `/public/courses${qs({ per_page: 50 })}`,
  )
  return asList(payload)
}

export async function listCourses() {
  const payload = await api<Paginated<CourseRecord> | CourseRecord[]>('/courses')
  return asList(payload)
}

export async function listRooms() {
  const payload = await api<Paginated<RoomRecord> | RoomRecord[]>('/rooms')
  return asList(payload)
}

export async function listScheduleSlots(params?: { from?: string; to?: string; course_id?: number }) {
  const payload = await api<Paginated<ScheduleSlotRecord> | ScheduleSlotRecord[]>(
    `/schedule-slots${qs({
      from: params?.from,
      to: params?.to,
      course_id: params?.course_id,
      per_page: 100,
    })}`,
  )
  return asList(payload)
}

export async function createSlot(payload: {
  course_id: number
  coach_id: number
  room_id?: number | null
  starts_at: string
  ends_at?: string
  capacity?: number
  notes?: string
}) {
  return api<ScheduleSlotRecord>('/schedule-slots', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateSlot(
  id: number,
  payload: Partial<{
    course_id: number
    coach_id: number
    room_id: number | null
    starts_at: string
    ends_at: string
    capacity: number
    notes: string
  }>,
) {
  return api<ScheduleSlotRecord>(`/schedule-slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function cancelSlot(id: number, notes?: string) {
  return api<ScheduleSlotRecord>(`/schedule-slots/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}
