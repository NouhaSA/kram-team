import { api } from '@/api/client'
import type { QrVerifyResult } from '@/types/api'

export async function verifyQr(qr_uuid: string, activity_type?: string) {
  return api<QrVerifyResult>('/qr/verify', {
    method: 'POST',
    body: JSON.stringify({ qr_uuid, activity_type }),
  })
}

export async function checkIn(qr_uuid: string, activity_type?: string) {
  return api<{
    attendance: unknown
    member: { id: number; full_name: string }
  }>('/qr/check-in', {
    method: 'POST',
    body: JSON.stringify({ qr_uuid, activity_type }),
  })
}

export async function checkOut(qr_uuid: string) {
  return api<unknown>('/qr/check-out', {
    method: 'POST',
    body: JSON.stringify({ qr_uuid }),
  })
}
