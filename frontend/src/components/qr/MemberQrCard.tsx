import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type Props = {
  value: string
  size?: number
  label?: string
}

export function MemberQrCard({ value, size = 260, label }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: { dark: '#0a0a0a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de générer le QR')
      })
    return () => {
      cancelled = true
    }
  }, [value, size])

  return (
    <div className="flex flex-col items-center gap-4 border border-white/10 bg-white p-6 text-black sm:flex-row sm:items-start">
      <div className="shrink-0 bg-white p-2">
        {dataUrl ? (
          <img src={dataUrl} alt="QR code adhérent" width={size} height={size} className="block" />
        ) : (
          <div
            className="flex items-center justify-center bg-neutral-100 text-sm text-neutral-500"
            style={{ width: size, height: size }}
          >
            {error ?? 'Génération…'}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-center sm:text-left">
        {label ? (
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-black uppercase">
            {label}
          </p>
        ) : null}
        <p className="mt-2 text-xs tracking-wider text-neutral-500 uppercase">Code check-in</p>
        <p className="mt-1 break-all font-mono text-sm text-neutral-800">{value}</p>
        <p className="mt-4 text-sm text-neutral-600">
          Présente ce QR à l’accueil pour le scan d’entrée / sortie.
        </p>
      </div>
    </div>
  )
}
