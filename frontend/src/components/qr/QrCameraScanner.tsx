import { useEffect, useId, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Camera, CameraOff } from 'lucide-react'

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i

export function extractQrUuid(raw: string): string | null {
  const match = raw.trim().match(UUID_RE)
  return match ? match[0].toLowerCase() : null
}

type Props = {
  onScan: (uuid: string) => void
  paused?: boolean
}

export function QrCameraScanner({ onScan, paused = false }: Props) {
  const reactId = useId().replace(/:/g, '')
  const elementId = `kt-qr-reader-${reactId}`
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanRef = useRef<{ value: string; at: number }>({ value: '', at: 0 })
  const onScanRef = useRef(onScan)
  const [active, setActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current
      scannerRef.current = null
      if (scanner?.isScanning) {
        void scanner.stop().catch(() => undefined)
      }
      scanner?.clear()
    }
  }, [])

  useEffect(() => {
    const scanner = scannerRef.current
    if (!scanner?.isScanning) return
    if (paused) {
      void scanner.pause(true)
    } else {
      scanner.resume()
    }
  }, [paused])

  async function start() {
    setStarting(true)
    setError(null)
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        })
      }

      const scanner = scannerRef.current
      if (scanner.isScanning) return

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const edge = Math.min(viewfinderWidth, viewfinderHeight) * 0.72
            return { width: edge, height: edge }
          },
          aspectRatio: 1,
        },
        (decoded) => {
          const uuid = extractQrUuid(decoded)
          if (!uuid) return

          const now = Date.now()
          if (
            lastScanRef.current.value === uuid &&
            now - lastScanRef.current.at < 2500
          ) {
            return
          }
          lastScanRef.current = { value: uuid, at: now }
          onScanRef.current(uuid)
        },
        () => undefined,
      )
      setActive(true)
    } catch (err) {
      setActive(false)
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’accéder à la caméra. Autorise l’accès ou utilise le champ manuel.',
      )
    } finally {
      setStarting(false)
    }
  }

  async function stop() {
    const scanner = scannerRef.current
    if (scanner?.isScanning) {
      try {
        await scanner.stop()
      } catch {
        // ignore
      }
    }
    setActive(false)
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden border border-white/10 bg-black">
        <div id={elementId} className="min-h-[280px] w-full overflow-hidden [&_video]:w-full" />
        {!active ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-kt-ink/90 px-6 text-center">
            <Camera className="text-kt-red" size={36} />
            <p className="text-sm text-kt-stone">
              Pointe la caméra vers le QR de l’adhérent pour enregistrer l’entrée.
            </p>
            <button
              type="button"
              onClick={() => void start()}
              disabled={starting}
              className="bg-kt-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-kt-red-hot disabled:opacity-60"
            >
              {starting ? 'Ouverture…' : 'Activer la caméra'}
            </button>
          </div>
        ) : null}
        {active && paused ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-kt-black/80 px-3 py-2 text-center text-xs text-kt-stone">
            Scan en pause — traite le membre actuel
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="border border-kt-red/40 bg-kt-red/10 px-3 py-2 text-sm">{error}</p>
      ) : null}

      {active ? (
        <button
          type="button"
          onClick={() => void stop()}
          className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-xs tracking-wide text-kt-stone uppercase transition hover:border-kt-red hover:text-white"
        >
          <CameraOff size={14} />
          Couper la caméra
        </button>
      ) : null}
    </div>
  )
}
