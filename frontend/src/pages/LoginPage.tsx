import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/auth/AuthContext'
import { ApiError } from '@/api/client'
import type { UserRole } from '@/types/api'

function homeForRoles(roles: UserRole[]) {
  if (roles.includes('admin')) return '/app/admin'
  if (roles.includes('reception')) return '/app/reception'
  if (roles.includes('coach')) return '/app/coach'
  return '/app/member'
}

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@kramteam.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to={homeForRoles(user.roles)} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const logged = await login(email, password)
      navigate(homeForRoles(logged.roles))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-kt-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(200,16,46,0.28),transparent_45%),radial-gradient(ellipse_at_80%_80%,rgba(200,16,46,0.12),transparent_40%)]" />
      <div className="absolute inset-y-0 right-0 w-1 bg-kt-red" />

      <div className="relative mx-auto flex min-h-svh max-w-6xl items-center px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <img src="/logo.png" alt="Kram Team" className="h-16 w-16 object-contain" />
          <p className="mt-6 text-xs tracking-[0.35em] text-kt-red uppercase">Force & Honor</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-6xl leading-none tracking-wide text-white uppercase">
            Kram
            <br />
            Team
          </h1>
          <p className="mt-4 text-kt-stone">Connectez-vous à la plateforme de gestion.</p>

          <form onSubmit={onSubmit} className="mt-10 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs tracking-wider text-kt-muted uppercase">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition focus:border-kt-red"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs tracking-wider text-kt-muted uppercase">Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition focus:border-kt-red"
                required
              />
            </label>

            {error ? (
              <p className="border border-kt-red/40 bg-kt-red/10 px-3 py-2 text-sm text-kt-cream">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-kt-red px-4 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-kt-red-hot disabled:opacity-60"
            >
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
