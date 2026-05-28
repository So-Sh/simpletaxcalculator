import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import CapitalGainsCalculator from '@/components/tax/CapitalGainsCalculator'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import {
  getStateCapitalGains,
  getAllCapitalGainsStates,
  getCapitalGainsMeta,
  getTreatmentLabel,
} from '@/lib/capital-gains'
import { getStateMeta } from '@/lib/rates'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

interface Props {
  params: Promise<{ state: string }>
}

export async function generateStaticParams() {
  return getAllCapitalGainsStates().map((s) => ({ state: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: slug } = await params
  const stateData = getStateCapitalGains(slug)
  if (!stateData) return {}

  const rateStr = stateData.topRate === 0
    ? 'no state capital gains tax'
    : `up to ${(stateData.topRate * 100).toFixed(2)}% state rate`

  return {
    title: `${stateData.name} Capital Gains Tax Calculator 2026 — simpletaxcalculator.app`,
    description: `Calculate capital gains tax in ${stateData.name} for 2026. ${stateData.name} has ${rateStr}. Includes 2026 federal brackets, NIIT, and ${stateData.name}-specific rules.`,
  }
}

function formatPercent(n: number) {
  return (n * 100).toFixed(2).replace(/\.?0+$/, '') + '%'
}

function formatCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default async function StateCapitalGainsPage({ params }: Props) {
  const { state: slug } = await params
  const stateData = getStateCapitalGains(slug)
  const stateMeta = getStateMeta(slug)
  const meta = getCapitalGainsMeta()

  if (!stateData) notFound()

  const isNoTax = stateData.treatment === 'no_tax'
  const stateName = stateData.name

  const stateFaqs = [
    {
      question: `Does ${stateName} have a capital gains tax?`,
      answer: isNoTax
        ? `No. ${stateName} does not tax capital gains at the state level. Residents generally only owe federal capital gains tax.`
        : stateData.treatment === 'flat'
        ? `Yes. ${stateName} taxes capital gains as part of its flat ${formatPercent(stateData.topRate)} state income tax rate. All income including capital gains is taxed at the same flat rate.`
        : `Yes. ${stateData.note}`,
    },
    {
      question: `What is the combined federal and ${stateName} capital gains tax rate?`,
      answer: isNoTax
        ? `For ${stateName} residents, the maximum combined rate on long-term capital gains is 23.8% — the 20% federal rate plus the 3.8% NIIT for high earners. There is no state addition.`
        : `For ${stateName} residents, the combined maximum long-term rate is approximately ${formatPercent(0.20 + stateData.topRate)} — the 20% federal rate plus ${formatPercent(stateData.topRate)} ${stateName} state rate. High earners may also owe the 3.8% NIIT, bringing the effective top combined rate to approximately ${formatPercent(0.238 + stateData.topRate)}.`,
    },
    ...meta.faqs.slice(0, 4),
  ]

  const appSchema = webApplicationSchema(`${stateName} Capital Gains Tax Calculator 2026`)
  const faqSchemaData = faqSchema(stateFaqs)

  const relatedTools = [
    { label: `${stateName} Sales Tax Calculator`, href: `/${slug}/sales-tax` },
    { label: 'Capital Gains Calculator — All States', href: '/capital-gains' },
    { label: 'Property Tax Estimator', href: '/property-tax' },
    { label: 'Self-Employment Tax Calculator', href: '/self-employment-tax' },
  ]

  return (
    <>
      <Script id="schema-webapp" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <Script id="schema-faq" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }} />

      <ToolPageLayout>
        <p className="text-xs text-muted">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          {' / '}
          <Link href={`/${slug}`} className="hover:text-primary transition-colors">{stateName}</Link>
          {' / '}
          <span className="text-body">Capital Gains Tax</span>
        </p>

        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            {stateName} Capital Gains Tax Calculator
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            {isNoTax
              ? `${stateName} does not tax capital gains at the state level. Residents generally only owe federal capital gains tax. Use the calculator below to estimate your federal liability.`
              : `${stateName} taxes capital gains at ${formatPercent(stateData.topRate)} (${getTreatmentLabel(stateData.treatment).toLowerCase()}). Calculate your combined federal and ${stateName} capital gains tax below.`
            }
          </p>
        </div>

        {/* State rate highlight */}
        <div className={`rounded-xl border px-5 py-4 flex items-center justify-between gap-4
          ${isNoTax ? 'bg-accent/5 border-accent/20' : 'bg-primary/5 border-primary/10'}`}>
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              {stateName} state capital gains rate
            </p>
            <p className={`text-2xl font-semibold ${isNoTax ? 'text-accent' : 'text-primary'}`}>
              {isNoTax ? 'No state tax' : formatPercent(stateData.topRate)}
            </p>
            {stateData.topRateWithSurcharge && (
              <p className="text-xs text-muted mt-1">
                {formatPercent(stateData.topRateWithSurcharge)} with surcharge above $1M
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Treatment</p>
            <p className="text-sm font-medium text-body">{getTreatmentLabel(stateData.treatment)}</p>
          </div>
        </div>

        <CapitalGainsCalculator
          lastUpdated={meta.lastUpdated}
          stateRate={isNoTax ? 0 : stateData.topRate}
          stateName={stateName}
          stateNote={stateData.note}
        />

        <DisclaimerBanner
          lastUpdated={meta.lastUpdated}
          officialSourceUrl={meta.officialSourceUrl}
          officialSourceLabel={meta.officialSourceLabel}
        />

        {/* Combined rate table */}
        <div className="tool-card">
          <h2 className="text-base font-semibold text-primary mb-4">
            Combined federal + {stateName} capital gains rates
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Scenario', 'Federal rate', `${stateMeta?.abbreviation ?? stateName} rate`, 'Combined'].map((h) => (
                    <th key={h} className="text-left py-2 pr-4 last:pr-0 text-xs font-semibold
                                           text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Long-term (0% federal bracket)', fed: 0.00 },
                  { label: 'Long-term (15% federal bracket)', fed: 0.15 },
                  { label: 'Long-term (20% federal bracket)', fed: 0.20 },
                  { label: 'Long-term + NIIT (20% + 3.8%)', fed: 0.238 },
                ].map((row, i) => (
                  <tr key={row.label}
                      className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg/60'}`}>
                    <td className="py-2.5 pr-4 text-body">{row.label}</td>
                    <td className="py-2.5 pr-4 font-mono text-muted">{formatPercent(row.fed)}</td>
                    <td className="py-2.5 pr-4 font-mono text-muted">
                      {isNoTax ? '0%' : formatPercent(stateData.topRate)}
                    </td>
                    <td className="py-2.5 font-mono font-semibold text-primary">
                      {formatPercent(row.fed + (isNoTax ? 0 : stateData.topRate))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2026 federal bracket reference */}
        <div className="tool-card">
          <h2 className="text-base font-semibold text-primary mb-3">
            2026 federal long-term capital gains brackets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { rate: '0%', single: `Up to ${formatCurrency(49450)}`, mfj: `Up to ${formatCurrency(98900)}`, color: 'text-accent' },
              { rate: '15%', single: `${formatCurrency(49451)}–${formatCurrency(545500)}`, mfj: `${formatCurrency(98901)}–${formatCurrency(613700)}`, color: 'text-primary' },
              { rate: '20%', single: `Over ${formatCurrency(545500)}`, mfj: `Over ${formatCurrency(613700)}`, color: 'text-red-500' },
            ].map((bracket) => (
              <div key={bracket.rate} className="rounded-lg border border-border bg-bg px-4 py-3">
                <p className={`text-lg font-semibold mb-2 ${bracket.color}`}>{bracket.rate}</p>
                <p className="text-xs text-muted">Single: {bracket.single}</p>
                <p className="text-xs text-muted">Married jointly: {bracket.mfj}</p>
              </div>
            ))}
          </div>
        </div>

        <FaqAccordion faqs={stateFaqs} />

        <RelatedTools links={relatedTools} />
      </ToolPageLayout>
    </>
  )
}