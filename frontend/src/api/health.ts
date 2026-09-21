import { api } from '@/api/client'

export type HealthGoal = 'lose_weight' | 'gain_weight' | 'maintain' | 'recomposition'

export type HealthOverview = {
  member: {
    id: number
    full_name: string | null
    gender: string | null
    date_of_birth: string | null
    coach_id: number | null
  }
  profile: {
    height_cm: number
    goal: HealthGoal
    goal_label: string
    start_weight_kg: number | null
    target_weight_kg: number | null
    target_date: string | null
    activity_level: number
    notes: string | null
  } | null
  latest: {
    weight_kg: number
    height_cm: number | null
    body_fat_percent: number | null
    recorded_at: string | null
  } | null
  metrics: {
    bmi: number | null
    bmi_category: string | null
    ideal_weight_min_kg: number | null
    ideal_weight_max_kg: number | null
    ideal_weight_kg: number | null
    start_weight_kg: number | null
    current_weight_kg: number | null
    target_weight_kg: number | null
    delta_kg: number | null
    progress_percent: number | null
    remaining_kg: number | null
  }
  nutrition: {
    bmr: number | null
    tdee: number | null
    calorie_target: number | null
    protein_g: number | null
    note: string | null
  }
  recommendations: string[]
  history: {
    id: number
    recorded_at: string | null
    weight_kg: number
    height_cm: number | null
    body_fat_percent: number | null
    muscle_mass_kg: number | null
    waist_cm: number | null
    resting_hr: number | null
    notes: string | null
    bmi: number | null
    recorded_by: string | null
  }[]
  entries_count: number
}

export async function getMyHealth() {
  return api<HealthOverview>('/health/me')
}

export async function getMemberHealth(memberId: number) {
  return api<HealthOverview>(`/health/members/${memberId}`)
}

export async function updateHealthProfile(
  memberId: number,
  payload: {
    height_cm: number
    goal: HealthGoal
    start_weight_kg?: number
    target_weight_kg?: number
    target_date?: string
    activity_level?: number
    notes?: string
  },
) {
  return api<HealthOverview>(`/health/members/${memberId}/profile`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function addHealthEntry(
  memberId: number,
  payload: {
    weight_kg: number
    height_cm?: number
    body_fat_percent?: number
    muscle_mass_kg?: number
    waist_cm?: number
    resting_hr?: number
    notes?: string
    recorded_at?: string
  },
) {
  return api<HealthOverview>(`/health/members/${memberId}/entries`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
