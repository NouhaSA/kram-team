import { api } from '@/api/client'
import type { Paginated } from '@/types/api'

export type StaffRole = 'reception' | 'coach'

export type StaffUser = {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string | null
  is_active: boolean
  hourly_rate?: number | null
  currency?: string
  roles?: string[]
}

function asList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data ?? []
}

export async function listStaff(role?: StaffRole) {
  const qs = role ? `?role=${role}` : ''
  const payload = await api<Paginated<StaffUser> | StaffUser[]>(`/admin/staff${qs}`)
  return asList(payload)
}

export const createStaff = (input: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password: string
  role: StaffRole
  is_active?: boolean
  hourly_rate?: number
}) =>
  api<StaffUser>('/admin/staff', {
    method: 'POST',
    body: JSON.stringify(input),
  })

export const updateStaff = (
  id: number,
  input: Partial<{
    first_name: string
    last_name: string
    email: string
    phone: string | null
    password: string
    role: StaffRole
    is_active: boolean
    hourly_rate: number | null
  }>,
) =>
  api<StaffUser>(`/admin/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })

export async function listCoaches() {
  const payload = await api<Paginated<StaffUser> | StaffUser[]>('/staff/coaches')
  return asList(payload)
}

export function staffRoleLabel(roles?: string[]) {
  if (roles?.includes('coach') && !roles.includes('reception')) return 'Coach'
  if (roles?.includes('reception')) return 'Gestionnaire'
  if (roles?.includes('coach')) return 'Coach'
  return roles?.[0] ?? '—'
}
