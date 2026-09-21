import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ScheduleSlotRecord } from '@/types/api'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isoDateKey(iso: string) {
  const d = new Date(iso)
  return toDateKey(d)
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function buildMonthCells(month: Date) {
  const first = startOfMonth(month)
  const startOffset = (first.getDay() + 6) % 7 // Monday = 0
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - startOffset)

  const cells: Date[] = []
  for (let i = 0; i < 42; i++) {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + i)
    cells.push(day)
  }
  return cells
}

export function monthRangeIso(month: Date) {
  const from = startOfMonth(month)
  const to = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59)
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

type Props = {
  slots: ScheduleSlotRecord[]
  month: Date
  onMonthChange: (month: Date) => void
  loading?: boolean
  onCancelSlot?: (id: number) => void
  onEditSlot?: (slot: ScheduleSlotRecord) => void
  canCancel?: boolean
  canEdit?: boolean
  variant?: 'public' | 'app'
}

export function ScheduleCalendar({
  slots,
  month,
  onMonthChange,
  loading,
  onCancelSlot,
  onEditSlot,
  canCancel,
  canEdit,
  variant = 'app',
}: Props) {
  const [selectedKey, setSelectedKey] = useState<string | null>(toDateKey(new Date()))

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduleSlotRecord[]>()
    for (const slot of slots) {
      const key = isoDateKey(slot.starts_at)
      const list = map.get(key) ?? []
      list.push(slot)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))
    }
    return map
  }, [slots])

  const cells = useMemo(() => buildMonthCells(month), [month])
  const todayKey = toDateKey(new Date())
  const selectedSlots = selectedKey ? (byDay.get(selectedKey) ?? []) : []
  const monthLabel = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const border = variant === 'public' ? 'border-white/10' : 'border-[var(--shell-border,rgb(255_255_255/0.08))]'
  const panel = variant === 'public' ? 'bg-black/30' : 'bg-[var(--shell-panel,transparent)]'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className={`border p-2 transition hover:border-kt-red ${border}`}
            aria-label="Mois précédent"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="min-w-[10rem] text-center font-[family-name:var(--font-display)] text-2xl tracking-wide uppercase">
            {monthLabel}
          </h2>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className={`border p-2 transition hover:border-kt-red ${border}`}
            aria-label="Mois suivant"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            const now = startOfMonth(new Date())
            onMonthChange(now)
            setSelectedKey(todayKey)
          }}
          className={`border px-3 py-2 text-xs tracking-wide uppercase transition hover:border-kt-red ${border}`}
        >
          Aujourd’hui
        </button>
      </div>

      <div className={`overflow-hidden border ${border}`}>
        <div className="grid grid-cols-7 border-b text-center text-[11px] tracking-wider text-kt-muted uppercase" style={{ borderColor: 'inherit' }}>
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-1 py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day) => {
            const key = toDateKey(day)
            const inMonth = day.getMonth() === month.getMonth()
            const daySlots = byDay.get(key) ?? []
            const isSelected = selectedKey === key
            const isToday = key === todayKey

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={`min-h-[88px] border-r border-b p-1.5 text-left transition sm:min-h-[110px] ${border} ${
                  isSelected ? 'bg-kt-red/15 ring-1 ring-inset ring-kt-red' : 'hover:bg-kt-red/5'
                } ${!inMonth ? 'opacity-35' : ''}`}
              >
                <div className="mb-1 flex items-center justify-between gap-1">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center text-xs ${
                      isToday ? 'bg-kt-red font-semibold text-white' : ''
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {daySlots.length > 0 ? (
                    <span className="hidden text-[10px] text-kt-muted sm:inline">{daySlots.length}</span>
                  ) : null}
                </div>
                <div className="space-y-1">
                  {daySlots.slice(0, 3).map((slot) => (
                    <div
                      key={slot.id}
                      className={`truncate px-1 py-0.5 text-[10px] leading-tight sm:text-[11px] ${
                        slot.is_full ? 'bg-kt-red/25 text-kt-red' : 'bg-kt-red/15 text-kt-cream'
                      }`}
                      title={`${slot.course?.name ?? 'Cours'} · ${timeLabel(slot.starts_at)}`}
                    >
                      <span className="font-medium">{timeLabel(slot.starts_at)}</span>
                      <span className="hidden sm:inline"> {slot.course?.name ?? 'Cours'}</span>
                    </div>
                  ))}
                  {daySlots.length > 3 ? (
                    <p className="text-[10px] text-kt-muted">+{daySlots.length - 3}</p>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className={`border p-4 sm:p-5 ${border} ${panel}`}>
        <p className="text-xs tracking-[0.25em] text-kt-red uppercase">Jour sélectionné</p>
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-wide uppercase">
          {selectedKey
            ? new Date(`${selectedKey}T12:00:00`).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })
            : '—'}
        </h3>

        {loading ? (
          <p className="mt-4 text-sm text-kt-muted">Chargement…</p>
        ) : !selectedSlots.length ? (
          <p className="mt-4 text-sm text-kt-muted">Aucun créneau ce jour.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5 border border-white/8">
            {selectedSlots.map((slot) => (
              <li key={slot.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-sm">
                <div>
                  <p className="font-medium">{slot.course?.name ?? `Créneau #${slot.id}`}</p>
                  <p className="text-kt-stone">
                    {timeLabel(slot.starts_at)} – {timeLabel(slot.ends_at)}
                    {slot.room?.name ? ` · ${slot.room.name}` : ''}
                    {slot.coach?.full_name ? ` · ${slot.coach.full_name}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={slot.is_full ? 'text-kt-red' : 'text-emerald-400'}>
                      {slot.is_full
                        ? 'Complet'
                        : `${slot.remaining_seats} place${slot.remaining_seats > 1 ? 's' : ''}`}
                    </p>
                    <p className="text-xs text-kt-muted">
                      {slot.booked_count}/{slot.capacity} · {slot.status_label}
                    </p>
                  </div>
                  {canEdit && onEditSlot && slot.status !== 'cancelled' ? (
                    <button
                      type="button"
                      onClick={() => onEditSlot(slot)}
                      className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-kt-red"
                    >
                      Modifier
                    </button>
                  ) : null}
                  {canCancel && onCancelSlot && slot.status !== 'cancelled' ? (
                    <button
                      type="button"
                      onClick={() => onCancelSlot(slot.id)}
                      className="border border-white/15 px-3 py-1.5 text-xs tracking-wide uppercase transition hover:border-kt-red"
                    >
                      Annuler
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
