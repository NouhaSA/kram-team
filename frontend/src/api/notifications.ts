import { api } from '@/api/client'
import type { Paginated } from '@/types/api'

export type AppNotification = {
  id: string
  type: string
  data: {
    title?: string
    body?: string
    category?: string
    category_label?: string
    meta?: Record<string, unknown>
  }
  read_at: string | null
  created_at: string
}

type NotificationsPayload = {
  unread_count: number
  notifications: Paginated<AppNotification> | AppNotification[]
}

function asList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data ?? []
}

export async function listNotifications(unreadOnly = false) {
  const qs = unreadOnly ? '?unread_only=1' : ''
  const payload = await api<NotificationsPayload>(`/notifications${qs}`)
  return {
    unread_count: payload.unread_count,
    items: asList(payload.notifications),
  }
}

export const getUnreadCount = () =>
  api<{ unread_count: number }>('/notifications/unread-count')

export const markNotificationRead = (id: string) =>
  api(`/notifications/${id}/read`, { method: 'POST', body: '{}' })

export const markAllNotificationsRead = () =>
  api<{ marked: number }>('/notifications/read-all', { method: 'POST', body: '{}' })
