import { api } from '@/api/client'
import type { MemberRecord, Paginated } from '@/types/api'

function asList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data ?? []
}

export async function listMembers() {
  const payload = await api<Paginated<MemberRecord> | MemberRecord[]>('/members')
  return asList(payload)
}

export async function createMember(input: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password: string
}) {
  return api<MemberRecord>('/members', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
