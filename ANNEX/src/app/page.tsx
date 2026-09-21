import Image from "next/image";
import { DownloadPdfButton } from "@/components/DownloadPdfButton";
import {
  advantages,
  brand,
  coachTraining,
  finances,
  gallery,
  intro,
  nextSteps,
  offer,
  opening,
  opportunity,
  profile,
} from "@/lib/franchise-content";

export default function FranchisePage() {
  return (
    <div className="overflow-x-hidden bg-kt-black text-kt-cream">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-kt-black/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-3">
            <Image
              src="/brand/logo.png"
              alt="Kram Team"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
            <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.25em] uppercase">
              Kram Team
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-kt-stone md:flex">
            <a href="#opportunite" className="transition hover:text-white">
              Opportunité
            </a>
            <a href="#formation" className="transition hover:text-white">
              Formation
            </a>
            <a href="#finances" className="transition hover:text-white">
              Finances
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <DownloadPdfButton
              className="rounded-sm border border-white/20 px-4 py-2 text-xs font-semibold tracking-wide text-white transition hover:border-kt-red disabled:opacity-60"
              label="PDF plateforme"
              href="/api/platform-prospect-pdf"
              filename="Kram-Team-Plateforme-Dossier-Prospection.pdf"
            />
            <DownloadPdfButton className="rounded-sm bg-kt-red px-4 py-2 text-xs font-semibold tracking-wide text-white transition hover:bg-kt-red-hot disabled:opacity-60" />
          </div>
        </div>
      </header>

      <main id="top">
        {/* Full-bleed hero */}
        <section className="relative min-h-[100svh] overflow-hidden">
          <Image
            src="/images/kb-hero.jpg"
            alt="Kickboxing Kram Team"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(11,11,12,0.92)_0%,rgba(11,11,12,0.72)_45%,rgba(11,11,12,0.35)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(200,16,46,0.28),transparent_55%)]" />
          <div className="absolute inset-y-0 right-0 w-1 bg-kt-red" />

          <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:pb-24">
            <div className="max-w-xl">
              <p className="animate-rise font-[family-name:var(--font-display)] text-xs tracking-[0.4em] text-kt-red uppercase">
                {brand.tagline}
              </p>
              <h1 className="animate-rise delay-1 mt-4 font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-white uppercase sm:text-7xl md:text-8xl">
                Kram
                <br />
                Team
              </h1>
              <div className="animate-sweep delay-2 mt-5 h-1 w-24 bg-kt-red" />
              <p className="animate-rise delay-3 mt-6 text-lg text-kt-stone md:text-xl">
                Franchise kickboxing & fitness — un modèle flexible, rentable,
                à fort impact social.
              </p>
              <div className="animate-rise delay-4 mt-10 flex flex-wrap gap-4">
                <DownloadPdfButton className="rounded-sm bg-kt-red px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-kt-red-hot disabled:opacity-60" />
                <a
                  href="#contact"
                  className="rounded-sm border border-white/25 bg-black/20 px-6 py-3.5 text-sm font-semibold tracking-wide text-white backdrop-blur-sm transition hover:border-white/50 hover:bg-white/10"
                >
                  Devenir franchisé
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Visual strip */}
        <section className="border-t border-white/5" aria-label="Ambiance kickboxing">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {gallery.slice(0, 4).map((shot, i) => (
              <figure
                key={shot.src}
                className={`relative aspect-[4/5] overflow-hidden md:aspect-[3/4] ${i > 1 ? "hidden md:block" : ""}`}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-cover transition duration-700 hover:scale-105"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 font-[family-name:var(--font-display)] text-xs tracking-[0.25em] text-white uppercase">
                  {shot.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Intro + image */}
        <section className="section-band border-t border-white/5 py-24 md:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-kt-red uppercase">
                01 — Concept
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-white uppercase md:text-4xl">
                {intro.title}
              </h2>
              <div className="relative mt-8 aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/kb-athlete.jpg"
                  alt="Athlète kickboxing Kram Team"
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 40vw"
                />
                <div className="absolute inset-y-0 left-0 w-1 bg-kt-red" />
              </div>
            </div>
            <div className="space-y-6 text-lg leading-relaxed text-kt-stone lg:col-span-7">
              <p>{intro.body}</p>
              <p className="border-l-2 border-kt-red pl-5 text-white">
                {intro.highlight}
              </p>
            </div>
          </div>
        </section>

        {/* Coach training quality */}
        <section
          id="formation"
          className="relative overflow-hidden border-t border-white/5 bg-[#0e0e10] py-24 md:py-32"
        >
          <div className="absolute inset-0 opacity-30">
            <Image
              src="/images/kb-sparring.jpg"
              alt=""
              fill
              className="object-cover object-top"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#0e0e10]/88" />
          </div>
          <div className="relative mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-kt-red uppercase">
                02 — Excellence coach
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-white uppercase md:text-5xl">
                {coachTraining.title}
              </h2>
              <p className="mt-5 text-lg text-kt-stone">{coachTraining.subtitle}</p>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                {coachTraining.body}
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {coachTraining.pillars.map((pillar, i) => (
                <article key={pillar.title} className="border-t border-kt-red/60 pt-5">
                  <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-kt-red">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg tracking-wide text-white uppercase">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-kt-stone">
                    {pillar.text}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[280px] overflow-hidden">
                <Image
                  src="/images/kb-ring.jpg"
                  alt="Formation sparring"
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 55vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <p className="absolute bottom-5 left-5 font-[family-name:var(--font-display)] text-sm tracking-[0.3em] text-white uppercase">
                  Formation terrain
                </p>
              </div>
              <div className="bg-kt-black/60 p-7 md:p-9">
                <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.3em] text-kt-red uppercase">
                  Modules clés
                </p>
                <ul className="mt-6 space-y-3">
                  {coachTraining.modules.map((mod) => (
                    <li
                      key={mod}
                      className="flex gap-3 border-b border-white/10 pb-3 text-sm text-kt-stone"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-kt-red" />
                      {mod}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Opportunity */}
        <section
          id="opportunite"
          className="border-t border-white/5 py-24 md:py-32"
        >
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid items-start gap-12 lg:grid-cols-2">
              <div>
                <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-kt-red uppercase">
                  03 — Opportunité
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-white uppercase md:text-5xl">
                  {opportunity.title}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-kt-stone">
                  {opportunity.body}
                </p>
                <p className="mt-4 text-base text-white/80">{opportunity.support}</p>

                <h3 className="mt-12 font-[family-name:var(--font-display)] text-2xl tracking-wide text-white uppercase">
                  {profile.title}
                </h3>
                <ul className="mt-8 space-y-4">
                  {profile.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 border-b border-white/10 pb-4 text-kt-stone"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-kt-red" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src="/images/kb-punch.jpg"
                    alt="Préparation kickboxing"
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 45vw"
                  />
                </div>
                <div className="relative overflow-hidden bg-[linear-gradient(145deg,#1a1a1e_0%,#0b0b0c_60%)] p-8 md:p-10">
                  <div className="absolute right-0 top-0 h-full w-1 bg-kt-red" />
                  <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.3em] text-kt-red uppercase">
                    Documents
                  </p>
                  <p className="mt-4 font-[family-name:var(--font-display)] text-3xl text-white uppercase">
                    Offre &amp; contrat
                  </p>
                  <p className="mt-4 max-w-sm text-kt-stone">
                    Téléchargez l&apos;offre visuelle ou le contrat de franchise
                    (fond blanc, articles juridiques, montants TND).
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <DownloadPdfButton className="rounded-sm bg-kt-red px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-kt-red-hot disabled:opacity-60" />
                    <DownloadPdfButton
                      label="Télécharger le contrat"
                      href="/api/contrat-franchise"
                      filename="Contrat-Franchise-Kram-Team.pdf"
                      className="rounded-sm border border-white/30 bg-white px-6 py-3.5 text-sm font-semibold tracking-wide text-kt-black transition hover:bg-kt-cream disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Offer */}
        <section id="offre" className="border-t border-white/5 bg-[#0e0e10] py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-xl">
              <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-kt-red uppercase">
                04 — Accompagnement
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-white uppercase md:text-5xl">
                {offer.title}
              </h2>
            </div>
            <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {offer.items.map((item, i) => (
                <article key={item.title} className="group">
                  <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-kt-red">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl tracking-wide text-white uppercase transition group-hover:text-kt-red-hot">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-kt-stone">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Finances */}
        <section
          id="finances"
          className="border-t border-white/5 py-24 md:py-32"
        >
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-xl">
              <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-kt-red uppercase">
                05 — Investissement
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-white uppercase md:text-5xl">
                {finances.title}
              </h2>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-2">
              <FinanceStat
                label={finances.entry.label}
                value={finances.entry.value}
                note={finances.entry.note}
                featured
              />
              <FinanceStat
                label={finances.setup.label}
                value={finances.setup.value}
                note={finances.setup.note}
              />
              {finances.monthly.map((row) => (
                <FinanceStat
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  note={row.note}
                />
              ))}
            </div>

            <div className="mt-4 overflow-hidden bg-kt-red px-6 py-8 md:px-10 md:py-10">
              <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.3em] text-white/70 uppercase">
                {finances.roi.label}
              </p>
              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <p className="font-[family-name:var(--font-display)] text-3xl text-white uppercase md:text-5xl">
                  {finances.roi.revenue}
                </p>
                <p className="font-[family-name:var(--font-display)] text-2xl text-white/90">
                  Marge nette {finances.roi.margin}
                </p>
              </div>
              <p className="mt-4 max-w-xl text-sm text-white/80">
                {finances.roi.note}
              </p>
            </div>
          </div>
        </section>

        {/* Opening + Advantages */}
        <section className="border-t border-white/5 bg-[#0e0e10] py-24 md:py-32">
          <div className="mx-auto grid max-w-6xl gap-20 px-5 lg:grid-cols-2">
            <div>
              <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-kt-red uppercase">
                06 — Ouverture
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-white uppercase md:text-4xl">
                {opening.title}
              </h2>
              <ol className="mt-10 space-y-8">
                {opening.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-kt-red font-[family-name:var(--font-display)] text-sm text-white">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-lg tracking-wide text-white uppercase">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-kt-stone">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <div className="relative mb-10 aspect-[16/10] overflow-hidden">
                <Image
                  src="/images/kb-stance.jpg"
                  alt="Kickboxing dans le ring"
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 45vw"
                />
              </div>
              <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-kt-red uppercase">
                07 — Avantages
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-white uppercase md:text-4xl">
                {advantages.title}
              </h2>
              <div className="mt-10 space-y-6">
                {advantages.items.map((item) => (
                  <div key={item.title} className="border-l border-white/15 pl-5">
                    <h3 className="font-[family-name:var(--font-display)] text-lg tracking-wide text-white uppercase">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-kt-stone">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Next steps */}
        <section className="border-t border-white/5 py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-kt-red uppercase">
              08 — Parcours
            </p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl tracking-tight text-white uppercase md:text-5xl">
              {nextSteps.title}
            </h2>
            <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {nextSteps.steps.map((step, i) => (
                <li
                  key={step}
                  className="border border-white/10 bg-kt-black/40 p-5 transition hover:border-kt-red/50"
                >
                  <span className="font-[family-name:var(--font-display)] text-2xl text-kt-red">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-kt-stone">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="relative overflow-hidden border-t border-white/5 py-24 md:py-32"
        >
          <Image
            src="/images/kb-fight.jpg"
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.35),rgba(11,11,12,0.92)_70%)]" />
          <div className="relative mx-auto max-w-6xl px-5 text-center">
            <Image
              src="/brand/logo.png"
              alt=""
              width={96}
              height={96}
              className="mx-auto h-20 w-20 object-contain opacity-90"
            />
            <h2 className="mt-8 font-[family-name:var(--font-display)] text-4xl tracking-tight text-white uppercase md:text-6xl">
              Prêt à rejoindre
              <br />
              Kram Team ?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-kt-stone">
              Demandez le dossier complet et échangez avec notre équipe
              franchise.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <DownloadPdfButton
                label="Télécharger l'offre"
                className="rounded-sm bg-kt-red px-7 py-4 text-sm font-semibold tracking-wide text-white transition hover:bg-kt-red-hot disabled:opacity-60"
              />
              <DownloadPdfButton
                label="Télécharger le contrat"
                href="/api/contrat-franchise"
                filename="Contrat-Franchise-Kram-Team.pdf"
                className="rounded-sm border border-white/30 bg-white px-7 py-4 text-sm font-semibold tracking-wide text-kt-black transition hover:bg-kt-cream disabled:opacity-60"
              />
              <a
                href={`mailto:${brand.email}`}
                className="rounded-sm border border-white/25 px-7 py-4 text-sm font-semibold tracking-wide text-white transition hover:bg-white/5"
              >
                {brand.email}
              </a>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-kt-muted">
              <a href={`tel:${brand.phoneHref}`} className="hover:text-white">
                {brand.phone}
              </a>
              <a
                href={`https://${brand.website}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                {brand.website}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-kt-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.name}. Tous droits réservés.
          </p>
          <p className="font-[family-name:var(--font-display)] tracking-[0.3em] uppercase">
            {brand.tagline}
          </p>
        </div>
      </footer>
    </div>
  );
}

function FinanceStat({
  label,
  value,
  note,
  featured = false,
}: {
  label: string;
  value: string;
  note: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`border p-6 md:p-8 ${
        featured
          ? "border-kt-red/40 bg-kt-red/10"
          : "border-white/10 bg-kt-black/30"
      }`}
    >
      <p className="text-xs tracking-[0.2em] text-kt-muted uppercase">{label}</p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-white md:text-4xl">
        {value}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-kt-stone">{note}</p>
    </div>
  );
}
