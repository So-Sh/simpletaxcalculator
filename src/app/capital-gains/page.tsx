import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import CapitalGainsCalculator from '@/components/tax/CapitalGainsCalculator'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import {
  getAllCapitalGainsStates,
  getCapitalGainsMeta,
  getTreatmentLabel,
} from '@/lib/capital-gains'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Capital Gains Tax Calculator 2026 — Federal + All 50 States',
  description:
    'Calculate federal and state capital gains tax for 2026. Covers long-term and short-term rates, NIIT, all 50 states. Updated for IRS Rev. Proc. 2025-32.',
  openGraph: {
    title: 'Capital Gains Tax Calculator 2026 — Federal + All 50 States',
    description:
      'Free capital gains tax calculator. 2026 federal brackets, NIIT, and state rates for all 50 states.',
  },
}

const RELATED_TOOLS = [
  { label: 'Sales Tax Calculator', href: '/sales-tax' },
  { label: 'Property Tax Estimator', href: '/property-tax' },
]

function formatPercent(n: number) {
  return (n * 100).toFixed(2).replace(/\.?0+$/, '') + '%'
}

function formatCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// Treatment badge colors
function treatmentColor(treatment: string) {
  switch (treatment) {
    case 'no_tax':          return 'bg-accent/10 text-accent'
    case 'flat':            return 'bg-primary/8 text-primary'
    case 'ordinary_income': return 'bg-red-50 text-red-600'
    case 'preferential':    return 'bg-blue-50 text-blue-600'
    case 'special':         return 'bg-yellow-50 text-yellow-700'
    default:                return 'bg-bg text-muted'
  }
}

export default function CapitalGainsPillarPage() {
  const states = getAllCapitalGainsStates()
  const meta = getCapitalGainsMeta()
  const { federal } = meta

  const appSchema = webApplicationSchema('Capital Gains Tax Calculator 2026')
  const faqSchemaData = faqSchema(meta.faqs)

  // Sort states: no_tax first, then by rate ascending
  const sortedStates = [...states].sort((a, b) => {
    if (a.topRate === 0 && b.topRate > 0) return -1
    if (b.topRate === 0 && a.topRate > 0) return 1
    return a.topRate - b.topRate
  })

  const noTaxStates = states.filter((s) => s.treatment === 'no_tax')
  const taxedStates = states.filter((s) => s.treatment !== 'no_tax')
    .sort((a, b) => b.topRate - a.topRate)

  return (
    <>
      <Script id="schema-webapp" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <Script id="schema-faq" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }} />

      <ToolPageLayout>

        {/* Header */}
        <div>
          <p className="section-label mb-2">Free · No signup · 2026 rates</p>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            Capital Gains Tax Calculator
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            Estimate your federal and state capital gains tax for 2026. Enter your purchase
            price, sale price, holding period, and income to calculate your tax liability.
            Covers long-term and short-term rates, NIIT, and all 50 state rates.
          </p>
        </div>

        {/* Calculator */}
        <CapitalGainsCalculator lastUpdated={meta.lastUpdated} />

        {/* Disclaimer */}
        <DisclaimerBanner
          lastUpdated={meta.lastUpdated}
          officialSourceUrl={meta.officialSourceUrl}
          officialSourceLabel={meta.officialSourceLabel}
        />

        {/* 2026 Federal brackets table */}
        <div className="tool-card">
          <h2 className="text-base font-semibold text-primary mb-1">
            2026 federal long-term capital gains tax brackets
          </h2>
          <p className="text-sm text-muted mb-4">
            Source: IRS Revenue Procedure 2025-32. Thresholds are based on taxable income
            after deductions, not gross income.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Rate', 'Single', 'Married Jointly', 'Head of Household'].map((h) => (
                    <th key={h} className="text-left py-2 pr-4 last:pr-0 text-xs font-semibold
                                           text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2.5 pr-4 font-semibold text-accent">0%</td>
                  <td className="py-2.5 pr-4 text-body">Up to {formatCurrency(49450)}</td>
                  <td className="py-2.5 pr-4 text-body">Up to {formatCurrency(98900)}</td>
                  <td className="py-2.5 text-body">Up to {formatCurrency(66200)}</td>
                </tr>
                <tr className="border-b border-border bg-bg/60">
                  <td className="py-2.5 pr-4 font-semibold text-primary">15%</td>
                  <td className="py-2.5 pr-4 text-body">{formatCurrency(49451)} – {formatCurrency(545500)}</td>
                  <td className="py-2.5 pr-4 text-body">{formatCurrency(98901)} – {formatCurrency(613700)}</td>
                  <td className="py-2.5 text-body">{formatCurrency(66201)} – {formatCurrency(545500)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-semibold text-red-500">20%</td>
                  <td className="py-2.5 pr-4 text-body">Over {formatCurrency(545500)}</td>
                  <td className="py-2.5 pr-4 text-body">Over {formatCurrency(613700)}</td>
                  <td className="py-2.5 text-body">Over {formatCurrency(545500)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-3 leading-relaxed">
            High-income earners may also owe the 3.8% Net Investment Income Tax (NIIT)
            when MAGI exceeds $200,000 (single) or $250,000 (married jointly).
            Short-term gains on assets held 12 months or less are taxed at ordinary income
            rates of 10%–37%.
          </p>
        </div>

        {/* States with no capital gains tax */}
        <div className="tool-card">
          <h2 className="text-base font-semibold text-primary mb-1">
            States with no capital gains tax
          </h2>
          <p className="text-sm text-muted mb-4">
            These states have no state capital gains tax.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {noTaxStates.map((state) => (
              <Link
                key={state.slug}
                href={`/${state.slug}/capital-gains`}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border
                           border-border hover:border-accent/40 hover:bg-bg transition-all group text-sm"
              >
                <span className="font-medium text-body group-hover:text-primary">{state.name}</span>
                <span className="text-accent font-semibold">0%</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Full state comparison table */}
        <div className="tool-card">
          <h2 className="text-base font-semibold text-primary mb-1">
            Capital gains tax rates by state — 2026
          </h2>
          <p className="text-sm text-muted mb-4">
            Sorted highest to lowest. Most states tax capital gains as ordinary income.
            Select a state for a detailed breakdown and calculator.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['State', 'Top rate', 'Treatment', ''].map((h, i) => (
                    <th key={i} className={`py-2 text-xs font-semibold text-muted uppercase
                                            tracking-wider ${i === 0 ? 'text-left pr-4' : 'text-right'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {taxedStates.map((state, i) => (
                  <tr key={state.slug}
                      className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg/60'}`}>
                    <td className="py-2.5 pr-4">
                      <Link href={`/${state.slug}/capital-gains`}
                            className="font-medium text-accent hover:underline underline-offset-2">
                        {state.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono font-semibold text-primary">
                      {formatPercent(state.topRate)}
                      {state.topRateWithSurcharge && (
                        <span className="text-xs text-muted font-normal ml-1">
                          ({formatPercent(state.topRateWithSurcharge)} w/ surcharge)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                                        ${treatmentColor(state.treatment)}`}>
                        {getTreatmentLabel(state.treatment)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <Link href={`/${state.slug}/capital-gains`}
                            className="text-xs text-accent hover:underline">
                        Calculate →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <FaqAccordion faqs={meta.faqs} />

        {/* Related tools */}
        <RelatedTools links={RELATED_TOOLS} />

      </ToolPageLayout>
    </>
  )
}