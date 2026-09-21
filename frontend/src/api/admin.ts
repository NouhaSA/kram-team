import { api } from '@/api/client'
import type { Paginated } from '@/types/api'

export type ActivityLogItem = {
  id: number
  action: string
  description: string
  actor_role: string | null
  actor_role_label: string
  user: { id: number; full_name: string; email: string } | null
  meta?: Record<string, unknown> | null
  created_at: string | null
}

export type AdminAccount = {
  id: number
  full_name: string
  email: string
  phone: string | null
  is_active: boolean
  roles: string[]
  member_id: number | null
  created_at: string | null
}

function asList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data ?? []
}

export async function listActivity(params?: {
  role?: string
  action?: string
  user_id?: number
}) {
  const search = new URLSearchParams()
  if (params?.role) search.set('role', params.role)
  if (params?.action) search.set('action', params.action)
  if (params?.user_id) search.set('user_id', String(params.user_id))
  search.set('per_page', '50')
  const qs = search.toString()
  const payload = await api<Paginated<ActivityLogItem> | ActivityLogItem[]>(
    `/admin/activity?${qs}`,
  )
  return asList(payload)
}

export async function listAccounts(role?: string) {
  const qs = role ? `?role=${role}&per_page=50` : '?per_page=50'
  const payload = await api<Paginated<AdminAccount> | AdminAccount[]>(`/admin/accounts${qs}`)
  return asList(payload)
}

export const toggleAccount = (id: number, is_active: boolean) =>
  api(`/admin/accounts/${id}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ is_active }),
  })
