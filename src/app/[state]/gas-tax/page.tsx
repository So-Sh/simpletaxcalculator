import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import GasTaxCalculator from '@/components/tax/GasTaxCalculator'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import { getStateGasTax, getAllGasTaxStates, getGasTaxMeta } from '@/lib/gas-tax'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

interface Props {
  params: Promise<{ state: string }>
}

export async function generateStaticParams() {
  return getAllGasTaxStates().map((s) => ({ state: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: slug } = await params
  const stateData = getStateGasTax(slug)
  if (!stateData) return {}

  return {
    title: `${stateData.name} Gas Tax Calculator 2026 — simpletaxcalculator.app`,
    description: `${stateData.name} gas tax is ${stateData.gasoline.combinedRateCents.toFixed(1)}¢/gal for gasoline and ${stateData.diesel.combinedRateCents.toFixed(1)}¢/gal for diesel (all fees included). Combined with federal tax, see your per-fill-up cost.`,
  }
}

function formatCents(n: number) {
  return n.toFixed(1) + '¢'
}

function formatCurrency(n: number) {
  return '$' + n.toFixed(2)
}

const FEDERAL_GAS_CENTS = 18.4
const FEDERAL_DIESEL_CENTS = 24.4
const FEDERAL_LUST = 0.1

export default async function StateGasTaxPage({ params }: Props) {
  const { state: slug } = await params
  const stateData = getStateGasTax(slug)
  const meta = getGasTaxMeta()

  if (!stateData) notFound()

  // Use combined rates as the headline figures (includes all fees, matches what drivers actually pay)
  const gasCombined = stateData.gasoline.combinedRateCents
  const dieselCombined = stateData.diesel.combinedRateCents
  const gasExcise = stateData.gasoline.exciseRateCents
  const dieselExcise = stateData.diesel.exciseRateCents

  const gasHasDiff = gasCombined !== gasExcise
  const dieselHasDiff = dieselCombined !== dieselExcise

  const totalGasCents = gasCombined + FEDERAL_GAS_CENTS + FEDERAL_LUST
  const totalDieselCents = dieselCombined + FEDERAL_DIESEL_CENTS + FEDERAL_LUST

  // State-specific FAQs
  const stateFaqs = [
    {
      question: `What is the gas tax in ${stateData.name}?`,
      answer: `${stateData.name}'s state gasoline tax is ${formatCents(gasCombined)} per gallon (all fees included${gasHasDiff ? `; excise-only is ${formatCents(gasExcise)}` : ''}) and the diesel tax is ${formatCents(dieselCombined)} per gallon${dieselHasDiff ? ` (excise-only: ${formatCents(dieselExcise)})` : ''}. Combined with the federal 18.4¢/gal gasoline excise and 0.1¢/gal LUST fee, drivers in ${stateData.name} pay a total of ${formatCents(totalGasCents)} per gallon of gasoline in state and federal taxes.`,
    },
    {
      question: `How much gas tax do I pay on a full tank in ${stateData.name}?`,
      answer: `On a 15-gallon fill-up with gasoline in ${stateData.name}, you pay approximately ${formatCurrency(stateData.gasoline.combinedRate * 15)} in state taxes (all fees) plus ${formatCurrency((FEDERAL_GAS_CENTS + FEDERAL_LUST) / 100 * 15)} in federal tax — a combined total of ${formatCurrency(totalGasCents / 100 * 15)} in taxes per fill-up. Use the calculator above to adjust for your tank size.`,
    },
    ...(gasHasDiff
      ? [{
        question: `What is the difference between ${stateData.name}'s excise tax and combined tax on fuel?`,
        answer: `${stateData.name}'s gasoline excise tax is ${formatCents(gasExcise)}/gal — this is the pure statutory per-gallon tax set by the state legislature. The combined rate of ${formatCents(gasCombined)}/gal includes the excise plus additional state-level fees such as environmental surcharges, petroleum storage tank fees, or sales tax components. The combined rate is what drivers effectively pay per gallon.`,
      }]
      : []),
    ...meta.faqs.slice(0, 3),
  ]

  const appSchema = webApplicationSchema(`${stateData.name} Gas Tax Calculator 2026`)
  const faqSchemaData = faqSchema(stateFaqs)

  const relatedTools = [
    { label: `${stateData.name} Sales Tax Calculator`, href: `/${slug}/sales-tax` },
    { label: 'Gas Tax — All States', href: '/gas-tax' },
    { label: 'Self-Employment Tax Calculator', href: '/self-employment-tax' },
    { label: 'Capital Gains Calculator', href: '/capital-gains' },
  ]

  return (
    <>
      <Script id="schema-webapp" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <Script id="schema-faq" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }} />

      <ToolPageLayout>

        {/* Breadcrumb */}
        <p className="text-xs text-muted">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          {' / '}
          <Link href={`/${slug}`} className="hover:text-primary transition-colors">{stateData.name}</Link>
          {' / '}
          <span className="text-body">Gas Tax</span>
        </p>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            {stateData.name} Gas Tax Calculator
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            {stateData.name} charges {formatCents(gasCombined)}/gal on gasoline
            and {formatCents(dieselCombined)}/gal on diesel (all state taxes and fees).
            Combined with the federal tax, drivers in {stateData.name} pay{' '}
            {formatCents(totalGasCents)}/gal total on gasoline.
            {gasHasDiff && (
              <> The base excise rate is {formatCents(gasExcise)}/gal.</>
            )}
          </p>
        </div>

        {/* Rate highlight cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: `${stateData.abbreviation} gasoline (combined)`,
              value: formatCents(gasCombined),
              sub: gasHasDiff ? `excise: ${formatCents(gasExcise)}` : null,
              muted: false,
            },
            {
              label: `${stateData.abbreviation} diesel (combined)`,
              value: formatCents(dieselCombined),
              sub: dieselHasDiff ? `excise: ${formatCents(dieselExcise)}` : null,
              muted: true,
            },
            {
              label: 'Federal gasoline tax',
              value: formatCents(FEDERAL_GAS_CENTS + FEDERAL_LUST),
              sub: `${formatCents(FEDERAL_GAS_CENTS)} excise + ${formatCents(FEDERAL_LUST)} LUST`,
              muted: true,
            },
            {
              label: 'Combined (gas + federal)',
              value: formatCents(totalGasCents),
              sub: null,
              muted: false,
            },
          ].map((card) => (
            <div key={card.label} className="tool-card text-center py-4">
              <p className="text-xs text-muted mb-1 leading-tight">{card.label}</p>
              <p className={`text-xl font-semibold ${card.muted ? 'text-muted' : 'text-primary'}`}>
                {card.value}
              </p>
              {card.sub && (
                <p className="text-xs text-muted/70 mt-0.5">{card.sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* Calculator */}
        <GasTaxCalculator
          gasoline={stateData.gasoline}
          diesel={stateData.diesel}
          stateName={stateData.name}
          lastUpdated={meta.lastUpdated}
        />

        {/* Disclaimer */}
        <DisclaimerBanner
          lastUpdated={meta.lastUpdated}
          officialSourceUrl={stateData.officialSourceUrl}
          officialSourceLabel={stateData.officialSourceLabel}
        />

        {/* Per fill-up breakdown table */}
        <div className="tool-card">
          <h2 className="text-base font-semibold text-primary mb-1">
            Gas tax per fill-up in {stateData.name}
          </h2>
          {gasHasDiff && (
            <p className="text-xs text-muted mb-4">
              State column uses the combined rate ({formatCents(gasCombined)}/gal, all fees).
              Excise-only rate is {formatCents(gasExcise)}/gal.
            </p>
          )}
          {!gasHasDiff && <div className="mb-4" />}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Tank size', 'State tax', 'Federal tax', 'Total tax'].map((h) => (
                    <th key={h} className="text-left py-2 pr-4 last:pr-0 text-xs font-semibold
                                           text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[10, 12, 15, 18, 20, 25, 30].map((gal, i) => (
                  <tr key={gal}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg/60'}`}>
                    <td className="py-2.5 pr-4 text-body font-medium">{gal} gallons</td>
                    <td className="py-2.5 pr-4 font-mono text-muted">
                      {formatCurrency(stateData.gasoline.combinedRate * gal)}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-muted">
                      {formatCurrency((FEDERAL_GAS_CENTS + FEDERAL_LUST) / 100 * gal)}
                    </td>
                    <td className="py-2.5 font-mono font-semibold text-primary">
                      {formatCurrency(totalGasCents / 100 * gal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-3">
            Gasoline only. State tax uses combined rate (all fees).
            Federal includes 18.4¢ excise + 0.1¢ LUST fee.
          </p>
        </div>

        {/* State note */}
        {stateData.note && (
          <div className="rounded-lg border border-border bg-bg px-4 py-3">
            <p className="text-xs text-muted leading-relaxed">
              <strong className="text-body">{stateData.name} note:</strong> {stateData.note}
            </p>
          </div>
        )}

        {/* FAQ */}
        <FaqAccordion faqs={stateFaqs} />

        {/* Related */}
        <RelatedTools links={relatedTools} />

      </ToolPageLayout>
    </>
  )
}