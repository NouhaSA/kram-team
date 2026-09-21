import { api } from '@/api/client'
import type { Paginated } from '@/types/api'

export type GreenProfile = {
  member_id: number
  green_score: number
  eco_points: number
  green_level: number
  level: { name: string; slug: string; min_points: number; rank: number } | null
  next_level: { name: string; min_points: number; points_needed: number } | null
  badges: { id: number; name: string; slug: string; icon: string | null }[]
  impact: {
    co2_kg: number
    water_liters: number
    trees_planted: number
    waste_items: number
  }
}

export type EcoRule = {
  id: number
  code: string
  name: string
  category: string
  points: number
  validation_type: string
  is_active: boolean
}

export type EcoChallenge = {
  id: number
  name: string
  slug: string
  description: string | null
  target_count: number
  reward_points: number
  ends_at: string
  joined?: boolean
  progress?: number
  completed?: boolean
}

export type EcoReward = {
  id: number
  name: string
  slug: string
  description: string | null
  cost_points: number
  stock: number | null
}

export type EcoRedemption = {
  id: number
  points_spent: number
  status: string
  redeemed_at: string
  reward?: EcoReward
  member?: { id: number; user?: { first_name: string; last_name: string } }
}

export type LeaderboardRow = {
  rank?: number
  member_id: number
  full_name: string
  eco_points: number
  green_level?: number
}

export type EcoAction = {
  id: number
  status: string
  points: number
  notes: string | null
  submitted_at: string
  rule?: EcoRule
  member?: { id: number; user?: { first_name: string; last_name: string } }
}

function asList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data ?? []
}

export const getGreenProfile = () => api<GreenProfile>('/member/green-profile')

export const getEcoRules = () => api<EcoRule[]>('/green/rules')

export const getChallenges = () => api<EcoChallenge[]>('/green/challenges')

export const getRewards = () => api<EcoReward[]>('/green/rewards')

export const getLeaderboard = (period: 'global' | 'monthly' = 'global') =>
  api<LeaderboardRow[]>(`/green/leaderboard?period=${period}`)

export async function getEcoHistory() {
  const payload = await api<Paginated<EcoAction> | EcoAction[]>('/member/eco-history')
  return asList(payload)
}

export const submitEcoAction = (eco_rule_id: number, notes?: string, member_id?: number) =>
  api<EcoAction>('/member/eco-action', {
    method: 'POST',
    body: JSON.stringify({ eco_rule_id, notes, member_id }),
  })

export const joinChallenge = (id: number, member_id?: number) =>
  api(`/challenge/${id}/join`, {
    method: 'POST',
    body: JSON.stringify({ member_id }),
  })

export const redeemReward = (id: number, member_id?: number) =>
  api(`/reward/${id}/redeem`, {
    method: 'POST',
    body: JSON.stringify({ member_id }),
  })

export const getMyRedemptions = () => api<EcoRedemption[]>('/member/eco-redemptions')

export async function getPendingEcoActions() {
  const payload = await api<Paginated<EcoAction> | EcoAction[]>('/admin/eco-actions/pending')
  return asList(payload)
}

export const validateEcoAction = (id: number, decision: 'approved' | 'rejected', reason?: string) =>
  api(`/admin/eco-actions/${id}/validate`, {
    method: 'POST',
    body: JSON.stringify({ decision, reason }),
  })

export async function getPendingRedemptions() {
  const payload = await api<Paginated<EcoRedemption> | EcoRedemption[]>(
    '/admin/eco-redemptions/pending',
  )
  return asList(payload)
}

export const processRedemption = (
  id: number,
  decision: 'approved' | 'rejected',
  reason?: string,
) =>
  api(`/admin/eco-redemptions/${id}/process`, {
    method: 'POST',
    body: JSON.stringify({ decision, reason }),
  })
