import { api, setToken } from '@/api/client'
import type { User } from '@/types/api'

export async function login(email: string, password: string) {
  const data = await api<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data
}

export async function me() {
  return api<User>('/auth/me')
}

export async function logout() {
  try {
    await api('/auth/logout', { method: 'POST' })
  } finally {
    setToken(null)
  }
}
