import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllStates } from '@/lib/rates'

export const metadata: Metadata = {
  title: 'Simple Tax Calculator — Free US Tax Tools 2026',
  description:
    'Free US tax calculators for sales tax, property tax, inheritance tax, gas tax, and self-employment tax. State-specific rates updated for 2026. No signup required.',
}

// ---------------------------------------------------------------------------
// Pillar tools — show all 5, mark unbuilt ones as coming soon
// ---------------------------------------------------------------------------
const PILLARS = [
  {
    title: 'Sales Tax Calculator',
    description: 'Calculate sales tax by state and county. Includes all local combined rates.',
    href: '/sales-tax',
    live: true,
    tag: 'Most popular',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
        <path d="M3 4h14M3 8h9M3 12h11M3 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Property Tax Estimator',
    description: 'Estimate annual property tax based on assessed value and local mill rate.',
    href: '/property-tax',
    live: false,
    tag: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
        <path d="M3 17V9l7-6 7 6v8M8 17v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Inheritance Tax Calculator',
    description: 'Estimate inheritance tax liability by state based on estate value and heir relationship.',
    href: '/inheritance-tax',
    live: false,
    tag: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
        <path d="M10 3v11M7 11l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 17h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Gas Tax Calculator',
    description: 'Calculate state and federal gas tax per gallon and per fill-up, by state.',
    href: '/gas-tax',
    live: false,
    tag: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
        <path d="M5 17V5a2 2 0 012-2h4a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 8h2a2 2 0 012 2v4a1 1 0 01-1 1h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Self-Employment Tax Calculator',
    description: 'Estimate self-employment tax and quarterly estimated payment amounts.',
    href: '/self-employment-tax',
    live: false,
    tag: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 17c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

const STATS = [
  { value: '6', label: 'States covered' },
  { value: '5', label: 'Tax calculators' },
  { value: '2026', label: 'Rates updated' },
]

// Featured states — launch priority order
const FEATURED_STATE_SLUGS = ['ohio', 'arizona', 'pennsylvania', 'florida', 'texas', 'california']

export default function HomePage() {
  const allStates = getAllStates()
  const featuredStates = FEATURED_STATE_SLUGS
    .map((slug) => allStates.find((s) => s.slug === slug))
    .filter(Boolean) as typeof allStates

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="max-w-2xl">
          <p className="section-label mb-3">Free · No signup · Updated for 2026</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-primary leading-tight mb-4">
            US tax calculators
            <br />
            that actually work.
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-xl">
            State-specific sales tax, property tax, inheritance tax, and more.
            All rates sourced directly from official state Department of Revenue
            websites and updated quarterly.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 mt-8">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-primary">{s.value}</span>
              <span className="text-sm text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Pillar grid — all 5 tax types                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <p className="section-label mb-5">Tax calculators</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PILLARS.map((tool) => {
            const card = (
              <div className={`tool-card flex flex-col h-full transition-all duration-200
                ${tool.live
                  ? 'group hover:border-accent/40 hover:shadow-md cursor-pointer'
                  : 'opacity-60 cursor-default'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    {tool.icon}
                  </div>
                  {tool.tag && tool.live && (
                    <span className="text-2xs font-semibold tracking-wider text-accent
                                     bg-accent/10 px-2 py-0.5 rounded-full uppercase">
                      {tool.tag}
                    </span>
                  )}
                  {!tool.live && (
                    <span className="text-2xs font-semibold tracking-wider text-muted
                                     bg-bg border border-border px-2 py-0.5 rounded-full uppercase">
                      Coming soon
                    </span>
                  )}
                </div>
                <h2 className={`text-base font-semibold mb-1 transition-colors
                  ${tool.live ? 'text-primary group-hover:text-accent' : 'text-primary'}`}>
                  {tool.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed flex-1">
                  {tool.description}
                </p>
                {tool.live && (
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent">
                    Open calculator
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                      className="group-hover:translate-x-0.5 transition-transform">
                      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            )

            return tool.live ? (
              <Link key={tool.href} href={tool.href} className="flex flex-col">
                {card}
              </Link>
            ) : (
              <div key={tool.href} className="flex flex-col">
                {card}
              </div>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Featured states                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-baseline justify-between gap-4 mb-5">
            <p className="section-label">Popular state calculators</p>
            <Link href="/sales-tax"
              className="text-xs text-accent hover:underline underline-offset-2">
              View all states →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {featuredStates.map((state) => (
              <Link
                key={state.slug}
                href={`/${state.slug}/sales-tax`}
                className="tool-card flex flex-col items-center text-center gap-2 py-5
                           hover:border-accent/40 hover:shadow-md transition-all duration-200 group"
              >
                <span className="w-10 h-8 rounded-md bg-primary flex items-center justify-center
                                 text-white text-xs font-bold tracking-wide flex-shrink-0">
                  {state.abbreviation}
                </span>
                <span className="text-sm font-medium text-body group-hover:text-primary
                                 transition-colors leading-tight">
                  {state.name}
                </span>
                <span className="text-xs text-accent font-medium">
                  Sales Tax →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Trust section                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <p className="section-label mb-8 text-center">Why trust our rates</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Official sources only',
              body: 'Every rate is sourced directly from official state Department of Revenue websites — never from third-party aggregators. Each tool page links to the source.',
            },
            {
              title: 'Quarterly audits',
              body: 'We review all rates every quarter and update within 48 hours of any published change by a state authority.',
            },
            {
              title: 'Real humans, real checks',
              body: 'This site is maintained by a real person. See our editorial policy for the full rate verification process.',
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="w-1 rounded-full bg-accent flex-shrink-0 self-stretch" />
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-xs text-muted text-center leading-relaxed border-t border-border pt-6">
          All calculators are for informational purposes only and do not constitute tax advice.
          Consult a qualified tax professional for your specific situation.
        </p>
      </div>
    </>
  )
}