import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  cancelSlot,
  createSlot,
  listCourses,
  listRooms,
  listScheduleSlots,
  updateSlot,
} from '@/api/schedule'
import { listCoaches } from '@/api/staff'
import { ApiError } from '@/api/client'
import { ErrorState, Section } from '@/components/ui/DashboardBits'
import { ScheduleCalendar, monthRangeIso } from '@/components/schedule/ScheduleCalendar'
import { useAuth } from '@/auth/AuthContext'
import type { ScheduleSlotRecord } from '@/types/api'

function toLocalInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const emptyForm = {
  course_id: '',
  coach_id: '',
  room_id: '',
  starts_at: '',
  capacity: '',
  notes: '',
}

export function SchedulePage() {
  const { user, hasRole } = useAuth()
  const queryClient = useQueryClient()
  const canManage = hasRole('admin', 'reception', 'coach')
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const range = useMemo(() => monthRangeIso(month), [month])
  const [editingId, setEditingId] = useState<number | null>(null)

  const slotsQuery = useQuery({
    queryKey: ['schedule-slots-manage', range.from, range.to],
    queryFn: () => listScheduleSlots({ from: range.from, to: range.to }),
  })
  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: listCourses,
    enabled: canManage,
  })
  const roomsQuery = useQuery({
    queryKey: ['rooms'],
    queryFn: listRooms,
    enabled: canManage,
  })
  const coachesQuery = useQuery({
    queryKey: ['staff-coaches'],
    queryFn: listCoaches,
    enabled: canManage,
  })

  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!form.coach_id && user?.id && hasRole('coach') && !hasRole('admin', 'reception')) {
      setForm((f) => ({ ...f, coach_id: String(user.id) }))
    }
  }, [user?.id, form.coach_id, hasRole])

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['schedule-slots-manage'] })
    await queryClient.invalidateQueries({ queryKey: ['schedule-slots'] })
    await queryClient.invalidateQueries({ queryKey: ['public-slots'] })
  }

  const create = useMutation({
    mutationFn: () =>
      createSlot({
        course_id: Number(form.course_id),
        coach_id: Number(form.coach_id),
        room_id: form.room_id ? Number(form.room_id) : null,
        starts_at: new Date(form.starts_at).toISOString(),
        capacity: form.capacity ? Number(form.capacity) : undefined,
        notes: form.notes || undefined,
      }),
    onSuccess: async () => {
      setForm({ ...emptyForm, coach_id: hasRole('coach') && user?.id ? String(user.id) : '' })
      setFormError(null)
      setEditingId(null)
      await invalidate()
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Création impossible'),
  })

  const update = useMutation({
    mutationFn: () => {
      if (!editingId) throw new Error('Créneau requis')
      return updateSlot(editingId, {
        course_id: Number(form.course_id),
        coach_id: Number(form.coach_id),
        room_id: form.room_id ? Number(form.room_id) : null,
        starts_at: new Date(form.starts_at).toISOString(),
        capacity: form.capacity ? Number(form.capacity) : undefined,
        notes: form.notes || undefined,
      })
    },
    onSuccess: async () => {
      setForm({ ...emptyForm, coach_id: hasRole('coach') && user?.id ? String(user.id) : '' })
      setFormError(null)
      setEditingId(null)
      await invalidate()
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Modification impossible'),
  })

  const cancel = useMutation({
    mutationFn: (id: number) => cancelSlot(id),
    onSuccess: async () => {
      await invalidate()
    },
  })

  function startEdit(slot: ScheduleSlotRecord) {
    setEditingId(slot.id)
    setFormError(null)
    setForm({
      course_id: String(slot.course_id ?? slot.course?.id ?? ''),
      coach_id: String(slot.coach_id ?? slot.coach?.id ?? ''),
      room_id: slot.room_id != null ? String(slot.room_id) : slot.room?.id != null ? String(slot.room.id) : '',
      starts_at: toLocalInput(slot.starts_at),
      capacity: String(slot.capacity ?? ''),
      notes: slot.notes ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setFormError(null)
    setForm({ ...emptyForm, coach_id: hasRole('coach') && user?.id ? String(user.id) : '' })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (editingId) update.mutate()
    else create.mutate()
  }

  if (slotsQuery.error) return <ErrorState message={(slotsQuery.error as Error).message} />

  const pending = create.isPending || update.isPending

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Horaires</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-kt-cream uppercase">
        Planning
      </h1>

      {canManage ? (
        <Section title={editingId ? `Modifier créneau #${editingId}` : 'Nouveau créneau'}>
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.course_id}
              onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
              className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
              required
            >
              <option value="">Cours…</option>
              {(coursesQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={form.coach_id}
              onChange={(e) => setForm((f) => ({ ...f, coach_id: e.target.value }))}
              className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
              required
            >
              <option value="">Coach / responsable…</option>
              {(coachesQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name || `${c.first_name} ${c.last_name}`}
                </option>
              ))}
            </select>
            <select
              value={form.room_id}
              onChange={(e) => setForm((f) => ({ ...f, room_id: e.target.value }))}
              className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            >
              <option value="">Salle (optionnel)</option>
              {(roomsQuery.data ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · max {r.capacity}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
              className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
              required
            />
            <input
              type="number"
              min={1}
              placeholder="Capacité (défaut cours)"
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            />
            <input
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-kt-red"
            />
            {formError ? (
              <p className="sm:col-span-2 border border-kt-red/40 bg-kt-red/10 px-3 py-2 text-sm">{formError}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="bg-kt-red px-4 py-2 text-sm font-semibold text-white hover:bg-kt-red-hot disabled:opacity-60"
              >
                {pending ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Créer le créneau'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-white/15 px-4 py-2 text-sm tracking-wide uppercase transition hover:border-kt-red"
                >
                  Annuler l’édition
                </button>
              ) : null}
            </div>
          </form>
        </Section>
      ) : null}

      <Section title="Calendrier">
        <ScheduleCalendar
          slots={slotsQuery.data ?? []}
          month={month}
          onMonthChange={setMonth}
          loading={slotsQuery.isLoading}
          canCancel={canManage}
          canEdit={canManage}
          onCancelSlot={(id) => cancel.mutate(id)}
          onEditSlot={startEdit}
          variant="app"
        />
      </Section>
    </div>
  )
}
