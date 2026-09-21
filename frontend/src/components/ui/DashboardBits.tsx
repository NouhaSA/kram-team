import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div
      className="border p-5"
      style={{
        borderColor: 'var(--shell-border, rgb(255 255 255 / 0.08))',
        background:
          'linear-gradient(to bottom, color-mix(in oklab, var(--shell-text, white) 4%, transparent), transparent)',
      }}
    >
      <p className="text-xs tracking-[0.2em] text-kt-muted uppercase">{label}</p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-wide text-kt-cream">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-kt-stone">{hint}</p> : null}
    </div>
  )
}

export function Section({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.12em] uppercase text-kt-cream">
          {title}
        </h2>
        {action}
      </div>
      <div className="h-px w-16 bg-kt-red" />
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="border border-dashed px-5 py-10 text-center text-sm text-kt-muted"
      style={{ borderColor: 'var(--shell-border, rgb(255 255 255 / 0.1))' }}
    >
      {message}
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-kt-stone">
      Chargement…
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="border border-kt-red/40 bg-kt-red/10 px-5 py-4 text-sm text-kt-cream">
      {message}
    </div>
  )
}
