export type UserRole = 'admin' | 'reception' | 'coach' | 'member'

export type User = {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string | null
  avatar: string | null
  is_active: boolean
  roles: UserRole[]
  member?: {
    id: number
    qr_uuid: string
    eco_points: number
    green_score: number
    green_level: number
  } | null
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export type AdminDashboard = {
  kpis: {
    active_members: number
    active_subscriptions: number
    subscriptions_expiring_7d: number
    revenue_month: number
    revenue_today: number
    attendances_today: number
    bookings_today: number
    currency: string
  }
  charts: {
    revenue_last_30_days: { date: string; total: number }[]
    attendance_last_30_days: { date: string; total: number }[]
    popular_courses: { course: string; bookings: number }[]
  }
  green: {
    total_eco_points: number
    co2_kg: number
    trees_planted: number
  }
}

export type MemberDashboard = {
  member: {
    id: number
    full_name: string
    qr_uuid: string
    avatar: string | null
  }
  subscription: {
    id: number
    offer: string | null
    status: string
    starts_at: string | null
    ends_at: string | null
  } | null
  quotas: {
    id: number
    label: string
    remaining: number | null
    total: number | null
    consumed: number
    is_unlimited: boolean
    alert: string | null
  }[]
  next_bookings: {
    id: number
    status: string
    course: string | null
    starts_at: string | null
    coach: string | null
    room: string | null
  }[]
  green: {
    eco_points: number
    green_score: number
    green_level: number
  }
}

export type ReceptionDashboard = {
  kpis: {
    checkins_today: number
    open_sessions: number
    denied_today: number
    bookings_today: number
  }
  open_sessions: {
    id: number
    member: string | null
    checked_in_at: string | null
    activity_type: string | null
  }[]
  upcoming_slots: {
    id: number
    course: string | null
    starts_at: string
    capacity: number
    booked_count: number
    remaining_seats: number
    coach: string | null
    room: string | null
  }[]
}

export type CoachDashboard = {
  coach: { id: number; full_name: string }
  kpis: {
    sessions_today: number
    upcoming_sessions: number
    assigned_members: number
  }
  upcoming_slots: {
    id: number
    course: string | null
    room: string | null
    starts_at: string
    capacity: number
    booked_count: number
    remaining_seats: number
  }[]
  assigned_members: {
    id: number
    full_name: string
    eco_points: number
    green_level: number
  }[]
}

export type MemberRecord = {
  id: number
  qr_uuid: string
  is_active: boolean
  eco_points: number
  green_score: number
  green_level: number
  city: string | null
  user?: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string | null
    full_name?: string
  } | null
}

export type OfferRecord = {
  id: number
  name: string
  slug: string
  description: string | null
  type: string
  type_label: string
  price: string | number
  effective_price: number
  duration_days: number | null
  is_active: boolean
  quotas?: {
    id: number
    label: string
    quota_type: string
    total: number | null
    activity_type: string | null
  }[]
}

export type ScheduleSlotRecord = {
  id: number
  course_id?: number
  coach_id?: number
  room_id?: number | null
  starts_at: string
  ends_at: string
  capacity: number
  booked_count: number
  waitlist_count: number
  remaining_seats: number
  is_full: boolean
  is_bookable: boolean
  status: string
  status_label: string
  notes?: string | null
  course?: { id: number; name: string; activity_type?: string } | null
  coach?: { id: number; full_name: string } | null
  room?: { id: number; name: string } | null
}

export type BookingRecord = {
  id: number
  member_id?: number
  subscription_id?: number | null
  status: string
  status_label: string
  waitlist_position: number | null
  qr_code: string
  booked_at: string | null
  member?: MemberRecord | { id?: number; user?: { first_name: string; last_name: string; email: string } }
  subscription?: {
    id: number
    offer_id?: number
    offer?: { id: number; name: string; type?: string; requires_booking?: boolean }
  } | null
  schedule_slot?: ScheduleSlotRecord
}

export type QrVerifyResult = {
  member: {
    id: number
    full_name: string
    qr_uuid: string
    photo: string | null
  }
  access: {
    allowed: boolean
    reason: string | null
    has_open_session: boolean
    open_session_id: number | null
    action: 'check_in' | 'check_out' | null
  }
  subscription: {
    id: number
    offer: string | null
    ends_at: string | null
  } | null
  quota: {
    id: number
    label: string
    remaining: number | null
    total: number | null
  } | null
}

export type Paginated<T> = {
  data: T[]
  meta?: {
    current_page: number
    last_page: number
    total: number
  }
}
