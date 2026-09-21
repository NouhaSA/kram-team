import { api } from '@/api/client'
import type {
  AdminDashboard,
  CoachDashboard,
  MemberDashboard,
  ReceptionDashboard,
} from '@/types/api'

export const getAdminDashboard = () => api<AdminDashboard>('/dashboard/admin')
export const getReceptionDashboard = () => api<ReceptionDashboard>('/dashboard/reception')
export const getCoachDashboard = () => api<CoachDashboard>('/dashboard/coach')
export const getMemberDashboard = () => api<MemberDashboard>('/dashboard/member')

export type MemberStats = {
  member: {
    id: number
    full_name: string
    email?: string | null
    phone?: string | null
    qr_uuid: string
    avatar: string | null
    city?: string | null
    goals?: string | null
    is_active?: boolean
    coach?: string | null
    coach_id?: number | null
  }
  stats: {
    attendances_month: number
    hours_month: number
    attendances_total: number
    bookings_total: number
    bookings_upcoming: number
    spent_total: number
    spent_month: number
    currency: string
  }
  charts: {
    attendance_last_30_days: { date: string; total: number }[]
  }
  subscription: {
    id: number
    offer: string | null
    status: string
    starts_at: string | null
    ends_at: string | null
  } | null
  quotas: MemberDashboard['quotas']
  next_bookings: MemberDashboard['next_bookings']
  recent_attendances: {
    id: number
    checked_in_at: string | null
    checked_out_at: string | null
    duration_minutes: number | null
    activity_type: string | null
  }[]
  recent_payments: {
    id: number
    reference: string
    amount: number
    status: string
    method: string | null
    type: string | null
    paid_at: string | null
  }[]
  health: {
    height_cm: number | null
    goal: string | null
    goal_label: string | null
    target_weight_kg: number | null
    current_weight_kg: number | null
    last_recorded_at: string | null
  }
  green: MemberDashboard['green']
}

export const getMemberStats = (memberId: number) =>
  api<MemberStats>(`/dashboard/members/${memberId}`)
