import type { ApiResponse } from '@/types/api'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

function getToken(): string | null {
  return localStorage.getItem('kt_token')
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('kt_token', token)
  else localStorage.removeItem('kt_token')
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message ?? 'Erreur API',
      response.status,
      payload?.errors,
    )
  }

  return payload.data
}
