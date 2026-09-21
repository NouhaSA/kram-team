import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const programs = [
  {
    name: 'Kickboxing',
    text: 'Technique, puissance et condition — du débutant au combattant.',
    image:
      'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'MMA',
    text: 'Sol, stand-up et stratégie. Un entraînement complet et exigeant.',
    image:
      'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Fitness & Cardio',
    text: 'Force, endurance et discipline dans un cadre motivant.',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'CrossFit',
    text: 'Intensité, progression et communauté. Chaque séance compte.',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  },
]

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55 },
}

export function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-kt-black text-kt-cream">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-kt-black/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-3">
            <img src="/logo.png" alt="Kram Team" className="h-10 w-10 object-contain" />
            <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.28em] uppercase">
              Kram Team
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-kt-stone md:flex">
            <a href="#about" className="transition hover:text-white">
              À propos
            </a>
            <a href="#programs" className="transition hover:text-white">
              Programmes
            </a>
            <Link to="/planning" className="transition hover:text-white">
              Planning
            </Link>
            <a href="#join" className="transition hover:text-white">
              Rejoindre
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm text-kt-stone transition hover:text-white sm:inline"
            >
              Espace membre
            </Link>
            <a
              href="#join"
              className="bg-kt-red px-4 py-2 text-xs font-semibold tracking-wide text-white transition hover:bg-kt-red-hot"
            >
              Commencer
            </a>
          </div>
        </div>
      </header>

      {/* Hero — brand first, full-bleed */}
      <section id="top" className="relative min-h-[100svh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1599058945522-28d884b86c76?auto=format&fit=crop&w=2000&q=80"
          alt="Entraînement kickboxing Kram Team"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(11,11,12,0.92)_0%,rgba(11,11,12,0.72)_48%,rgba(11,11,12,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(200,16,46,0.28),transparent_55%)]" />
        <div className="absolute inset-y-0 right-0 w-1 bg-kt-red" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.4em] text-kt-red uppercase">
              Force & Honor
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-6xl leading-[0.92] tracking-wide text-white uppercase sm:text-8xl">
              Kram
              <br />
              Team
            </h1>
            <div className="mt-5 h-1 w-24 origin-left bg-kt-red" />
            <p className="mt-6 max-w-md text-lg text-kt-stone">
              Kickboxing, MMA et fitness — discipline, performance et communauté.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#join"
                className="bg-kt-red px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-kt-red-hot"
              >
                Rejoindre Kram Team
              </a>
              <Link
                to="/planning"
                className="border border-white/25 bg-black/20 px-6 py-3.5 text-sm font-semibold tracking-wide text-white backdrop-blur-sm transition hover:border-white/50"
              >
                Voir le planning
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-white/5 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
          <motion.div {...fade} className="relative min-h-[360px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80"
              alt="Séance d'entraînement"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-kt-black/70 to-transparent" />
          </motion.div>
          <motion.div {...fade} transition={{ duration: 0.55, delay: 0.1 }}>
            <div className="mb-4 flex gap-2">
              <span className="h-1 w-10 bg-kt-red" />
              <span className="h-1 w-4 bg-kt-red/50" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-white uppercase md:text-5xl">
              Maîtrise la force.
              <br />
              <span className="text-kt-red">Honore le combat.</span>
            </h2>
            <p className="mt-6 text-kt-stone leading-relaxed">
              Kram Team forme des athlètes et des passionnés dans un environnement exigeant,
              inclusif et professionnel. Coaching précis, progression mesurable, mental de guerrier.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6">
              <div>
                <p className="font-[family-name:var(--font-display)] text-4xl text-white">Elite</p>
                <p className="mt-1 text-sm text-kt-muted">Entraînement technique</p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-4xl text-white">Communauté</p>
                <p className="mt-1 text-sm text-kt-muted">Force collective</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="border-t border-white/5 bg-kt-ink/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <motion.div {...fade} className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-white uppercase md:text-5xl">
              Transforme la force en{' '}
              <span className="text-kt-red">maîtrise</span>
            </h2>
            <p className="mt-4 text-kt-stone">
              Des programmes adaptés à chaque niveau — du premier coup de pied au ring.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {programs.map((program, i) => (
              <motion.article
                key={program.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group relative min-h-[280px] overflow-hidden"
              >
                <img
                  src={program.image}
                  alt={program.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="mb-3 h-8 w-8 border border-kt-red bg-kt-red/20" />
                  <h3 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-white uppercase">
                    {program.name}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-kt-stone">{program.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="join" className="relative overflow-hidden border-t border-white/5 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.18),transparent_60%)]" />
        <motion.div {...fade} className="relative mx-auto max-w-3xl px-5 text-center">
          <img src="/logo.png" alt="" className="mx-auto h-20 w-20 object-contain" />
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white uppercase md:text-6xl">
            Prêt à rejoindre
            <br />
            <span className="text-kt-red">Kram Team</span> ?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-kt-stone">
            Accède à ton espace adhérent, réserve tes séances et suis ta progression.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="bg-kt-red px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-kt-red-hot"
            >
              Accéder à la plateforme
            </Link>
            <a
              href="mailto:contact@kramteam.com"
              className="border border-white/25 px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:border-white/50"
            >
              Nous contacter
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-kt-muted sm:flex-row">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain opacity-80" />
            <span>Kram Team · Force & Honor</span>
          </div>
          <Link to="/login" className="transition hover:text-white">
            Connexion
          </Link>
        </div>
      </footer>
    </div>
  )
}
