import { useMutation } from '@tanstack/react-query'
import { lazy, Suspense, useCallback, useState, type FormEvent } from 'react'
import { checkIn, checkOut, verifyQr } from '@/api/qr'
import { ApiError } from '@/api/client'
import type { QrVerifyResult } from '@/types/api'
import { ErrorState, Section } from '@/components/ui/DashboardBits'
import { extractQrUuid } from '@/components/qr/extractQrUuid'

const QrCameraScanner = lazy(() =>
  import('@/components/qr/QrCameraScanner').then((m) => ({ default: m.QrCameraScanner })),
)

export function QrScanPage() {
  const [qrUuid, setQrUuid] = useState('')
  const [activityType, setActivityType] = useState('')
  const [result, setResult] = useState<QrVerifyResult | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [autoEntry, setAutoEntry] = useState(true)
  const [busy, setBusy] = useState(false)

  const verify = useMutation({
    mutationFn: (uuid: string) => verifyQr(uuid, activityType || undefined),
    onSuccess: (data) => {
      setResult(data)
      setError(null)
      setMessage(null)
    },
    onError: (err) => {
      setResult(null)
      setError(err instanceof ApiError ? err.message : 'Vérification impossible')
    },
  })

  const action = useMutation({
    mutationFn: async (uuid: string) => {
      const current = result ?? (await verifyQr(uuid, activityType || undefined))
      if (current.access.action === 'check_out' || current.access.has_open_session) {
        return { kind: 'out' as const, data: await checkOut(uuid) }
      }
      if (!current.access.allowed) {
        throw new ApiError(current.access.reason ?? 'Accès refusé', 403)
      }
      return {
        kind: 'in' as const,
        data: await checkIn(uuid, activityType || undefined),
      }
    },
    onSuccess: async (res, uuid) => {
      setMessage(res.kind === 'out' ? 'Check-out enregistré.' : 'Entrée enregistrée.')
      setError(null)
      const refreshed = await verifyQr(uuid, activityType || undefined)
      setResult(refreshed)
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Scan refusé')
    },
  })

  const handleScannedUuid = useCallback(
    async (uuid: string) => {
      if (busy || verify.isPending || action.isPending) return
      setBusy(true)
      setQrUuid(uuid)
      setError(null)
      setMessage(null)
      try {
        const data = await verifyQr(uuid, activityType || undefined)
        setResult(data)

        if (autoEntry) {
          if (data.access.has_open_session || data.access.action === 'check_out') {
            await checkOut(uuid)
            setMessage(`Check-out — ${data.member.full_name}`)
          } else if (data.access.allowed) {
            await checkIn(uuid, activityType || undefined)
            setMessage(`Entrée — ${data.member.full_name}`)
          } else {
            setError(data.access.reason ?? 'Accès refusé')
            return
          }
          const refreshed = await verifyQr(uuid, activityType || undefined)
          setResult(refreshed)
        }
      } catch (err) {
        setResult(null)
        setError(err instanceof ApiError ? err.message : 'Scan impossible')
      } finally {
        setBusy(false)
      }
    },
    [activityType, autoEntry, busy, verify.isPending, action.isPending],
  )

  function onVerify(e: FormEvent) {
    e.preventDefault()
    const uuid = extractQrUuid(qrUuid) ?? qrUuid.trim()
    setQrUuid(uuid)
    verify.mutate(uuid)
  }

  const paused = busy || verify.isPending || action.isPending

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-kt-red uppercase">Accueil</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase">
        Scan QR
      </h1>
      <p className="mt-3 max-w-xl text-sm text-kt-stone">
        Scanne le QR de l’adhérent (espace Adhérent → Mon QR) pour enregistrer l’entrée ou la sortie.
      </p>

      <Section title="Caméra">
        <label className="mb-4 flex items-center gap-3 text-sm text-kt-stone">
          <input
            type="checkbox"
            checked={autoEntry}
            onChange={(e) => setAutoEntry(e.target.checked)}
            className="accent-kt-red"
          />
          Enregistrement auto (entrée / sortie au scan)
        </label>
        <Suspense
          fallback={
            <p className="border border-white/8 px-4 py-8 text-center text-sm text-kt-muted">
              Chargement de la caméra…
            </p>
          }
        >
          <QrCameraScanner onScan={(uuid) => void handleScannedUuid(uuid)} paused={paused} />
        </Suspense>
      </Section>

      <Section title="Saisie manuelle">
        <form onSubmit={onVerify} className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-xs tracking-wider text-kt-muted uppercase">QR UUID</span>
            <input
              value={qrUuid}
              onChange={(e) => setQrUuid(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm outline-none focus:border-kt-red"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs tracking-wider text-kt-muted uppercase">
              Activité (optionnel)
            </span>
            <input
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              placeholder="kickboxing, mma, fitness…"
              className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-kt-red"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={verify.isPending}
              className="bg-kt-red px-5 py-3 text-sm font-semibold text-white hover:bg-kt-red-hot disabled:opacity-60"
            >
              {verify.isPending ? 'Vérification…' : 'Vérifier l’accès'}
            </button>
          </div>
        </form>
      </Section>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} />
        </div>
      ) : null}
      {message ? (
        <p className="mt-6 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      {result ? (
        <Section title="Résultat">
          <div className="border border-white/8 p-5">
            <p className="font-[family-name:var(--font-display)] text-3xl tracking-wide uppercase">
              {result.member.full_name}
            </p>
            <p className="mt-2 font-mono text-xs text-kt-muted">{result.member.qr_uuid}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="border border-white/8 p-4">
                <p className="text-xs text-kt-muted uppercase">Accès</p>
                <p
                  className={`mt-2 text-lg ${
                    result.access.allowed
                      ? 'text-emerald-400'
                      : result.access.has_open_session
                        ? 'text-amber-300'
                        : 'text-kt-red'
                  }`}
                >
                  {result.access.allowed
                    ? 'Autorisé — check-in'
                    : result.access.has_open_session
                      ? 'Session ouverte — check-out'
                      : 'Refusé'}
                </p>
                {result.access.reason ? (
                  <p className="mt-1 text-sm text-kt-stone">{result.access.reason}</p>
                ) : null}
              </div>
              <div className="border border-white/8 p-4">
                <p className="text-xs text-kt-muted uppercase">Abonnement</p>
                <p className="mt-2 text-lg">{result.subscription?.offer ?? '—'}</p>
                {result.quota ? (
                  <p className="mt-1 text-sm text-kt-stone">
                    {result.quota.label}: {result.quota.remaining ?? '∞'} / {result.quota.total ?? '∞'}
                  </p>
                ) : null}
              </div>
            </div>

            {(result.access.allowed || result.access.has_open_session) && (
              <button
                type="button"
                onClick={() => action.mutate(qrUuid.trim())}
                disabled={action.isPending}
                className="mt-5 w-full border border-white/20 px-5 py-3 text-sm font-semibold tracking-wide text-white transition hover:border-kt-red hover:bg-kt-red disabled:opacity-60"
              >
                {action.isPending
                  ? 'Traitement…'
                  : result.access.has_open_session
                    ? 'Check-out'
                    : 'Check-in'}
              </button>
            )}
          </div>
        </Section>
      ) : null}
    </div>
  )
}
