import { api } from '@/api/client'

export type CoachReportPeriod = 'day' | 'week' | 'month'

export type CoachReportSlot = {
  id: number
  course: string | null
  room: string | null
  starts_at: string
  ends_at: string
  hours: number
  booked_count: number
  capacity: number
  status: string
  slot_pay?: number
}

export type CoachReportItem = {
  coach: { id: number; full_name: string; email: string }
  sessions: number
  hours: number
  hourly_rate: number
  currency: string
  salary: number
  people_trained: number
  bookings: number
  assigned_members: number
  avg_people_per_session: number
  series: { label: string; sessions: number; hours: number; bookings: number }[]
  slots: CoachReportSlot[]
}

export type CoachReportsPayload = {
  period: CoachReportPeriod
  period_label: string
  from: string
  to: string
  totals: {
    coaches: number
    sessions: number
    hours: number
    people_trained: number
    bookings: number
    salary?: number
    currency?: string
  }
  coaches: CoachReportItem[]
}

export async function getCoachReports(params: {
  period: CoachReportPeriod
  date?: string
  coach_id?: number
}) {
  const search = new URLSearchParams()
  search.set('period', params.period)
  if (params.date) search.set('date', params.date)
  if (params.coach_id) search.set('coach_id', String(params.coach_id))
  return api<CoachReportsPayload>(`/reports/coaches?${search.toString()}`)
}
