import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { listPublicCourses, listPublicSlots } from '@/api/schedule'
import { ScheduleCalendar, monthRangeIso } from '@/components/schedule/ScheduleCalendar'

export function PublicPlanningPage() {
  const [courseId, setCourseId] = useState('')
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const range = useMemo(() => monthRangeIso(month), [month])

  const coursesQuery = useQuery({
    queryKey: ['public-courses'],
    queryFn: listPublicCourses,
  })

  const slotsQuery = useQuery({
    queryKey: ['public-slots', courseId, range.from, range.to],
    queryFn: () =>
      listPublicSlots({
        from: range.from,
        to: range.to,
        course_id: courseId ? Number(courseId) : undefined,
      }),
  })

  return (
    <div className="min-h-svh bg-kt-black text-kt-cream">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-kt-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Kram Team" className="h-10 w-10 object-contain" />
            <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.28em] uppercase">
              Kram Team
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden text-sm text-kt-stone transition hover:text-white sm:inline">
              Accueil
            </Link>
            <Link
              to="/login"
              className="bg-kt-red px-4 py-2 text-xs font-semibold tracking-wide text-white transition hover:bg-kt-red-hot"
            >
              Réserver
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(200,16,46,0.22),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-14 md:py-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.4em] text-kt-red uppercase">
              Force & Honor
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase md:text-6xl">
              Planning
            </h1>
            <p className="mt-4 max-w-xl text-kt-stone">
              Calendrier mensuel des séances — clique un jour pour voir les créneaux et places restantes.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <label className="block min-w-[220px] flex-1">
            <span className="mb-1.5 block text-xs tracking-wider text-kt-muted uppercase">Cours</span>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-kt-red"
            >
              <option value="">Tous les cours</option>
              {(coursesQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <p className="pb-2 text-sm text-kt-muted">{slotsQuery.data?.length ?? 0} créneaux ce mois</p>
        </div>

        {slotsQuery.error ? (
          <p className="mb-4 border border-kt-red/40 bg-kt-red/10 px-4 py-3 text-sm">
            {(slotsQuery.error as Error).message}
          </p>
        ) : null}

        <ScheduleCalendar
          slots={slotsQuery.data ?? []}
          month={month}
          onMonthChange={setMonth}
          loading={slotsQuery.isLoading}
          variant="public"
        />

        <div className="mt-14 border border-white/8 bg-white/[0.02] px-6 py-8 text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-white uppercase">
            Réserve ta place
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-kt-stone">
            Connecte-toi à l’espace membre pour réserver un créneau ou rejoindre la liste d’attente.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block bg-kt-red px-6 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-kt-red-hot"
          >
            Espace membre
          </Link>
        </div>
      </main>
    </div>
  )
}
