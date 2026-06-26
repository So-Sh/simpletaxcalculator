// app/[state]/inheritance-tax/page.tsx

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import InheritanceTaxCalculator from '@/components/tax/InheritanceTaxCalculator'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import {
  getStateInheritanceTax,
  getAllInheritanceTaxStates,
  getInheritanceTaxMeta,
  getFederalEstateTax,
} from '@/lib/inheritance-tax'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

interface Props {
  params: Promise<{ state: string }>
}

// IMPORTANT: only generates pages for the 5 real inheritance-tax states.
// We deliberately do NOT build a page for every state — see CLAUDE.md
// "Tax types — current status" for the duplicate-content rationale. The
// other ~44 states are covered by the single comparison section on the
// /inheritance-tax pillar page instead.
export async function generateStaticParams() {
  return getAllInheritanceTaxStates().map((s) => ({ state: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: slug } = await params
  const stateData = getStateInheritanceTax(slug)
  if (!stateData) return {}

  return {
    title: `${stateData.name} Inheritance Tax Calculator 2026 — simpletaxcalculator.app`,
    description: `Calculate ${stateData.name} inheritance tax by beneficiary class. ${stateData.name} is one of only 5 US states with an inheritance tax. Rates, exemptions, and examples updated for 2026.`,
  }
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatPercent(n: number) {
  return (n * 100).toFixed(1).replace(/\.0$/, '') + '%'
}

export default async function StateInheritanceTaxPage({ params }: Props) {
  const { state: slug } = await params
  const stateData = getStateInheritanceTax(slug)
  const meta = getInheritanceTaxMeta()
  const federal = getFederalEstateTax()

  if (!stateData) notFound()

  const exemptClasses = stateData.beneficiaryClasses.filter((bc) => bc.rate === 0)
  const taxableClasses = stateData.beneficiaryClasses.filter((bc) => bc.rate !== 0)

  // State-specific FAQs — every page covers the federal estate tax layer too,
  // per CLAUDE.md's content requirement for inheritance-tax pages.
  const stateFaqs = [
    {
      question: `What is the inheritance tax rate in ${stateData.name}?`,
      answer: `${stateData.name}'s inheritance tax rate depends entirely on your relationship to the deceased. ${
        exemptClasses.length > 0
          ? `${exemptClasses.map((c) => c.class).join(', ')} are fully exempt. `
          : ''
      }${
        taxableClasses.length > 0
          ? `Other beneficiaries pay rates ranging from ${taxableClasses
              .map((c) => (c.rate !== null ? formatPercent(c.rate) : c.rateRange ? `${formatPercent(c.rateRange.min)}–${formatPercent(c.rateRange.max)}` : ''))
              .filter(Boolean)
              .join(' to ')}, depending on the beneficiary class and amount inherited.`
          : ''
      } Select your relationship to the deceased above for your specific rate and exemption.`,
    },
    ...(stateData.isCountyCollected
      ? [{
        question: `Who do I pay ${stateData.name} inheritance tax to?`,
        answer: `${stateData.name} is unique: inheritance tax is collected at the county level, not statewide, even though the rates are set by state law. You pay the county treasurer where the deceased person resided, or where any inherited real estate is located. If property is located in multiple counties, the tax is apportioned among them.`,
      }]
      : []),
    {
      question: `Does federal estate tax also apply in ${stateData.name}?`,
      answer: `Yes, separately. ${stateData.name}'s inheritance tax is a state-level tax paid by the beneficiary based on their relationship to the deceased. Federal estate tax is a completely separate tax paid by the estate itself, and only applies if the total estate exceeds ${formatCurrency(federal.exemptionPerIndividual)} (2026, per individual). Fewer than 1% of estates owe federal estate tax, but it's worth checking if the estate is large. Use the federal estate tax calculator above to check.`,
    },
    ...(stateData.earlyPaymentDiscount
      ? [{
        question: `Is there a discount for paying ${stateData.name} inheritance tax early?`,
        answer: `Yes. ${stateData.earlyPaymentDiscount.description}`,
      }]
      : []),
    ...(stateData.hasStateEstateTax
      ? [{
        question: `Does ${stateData.name} also have a separate estate tax?`,
        answer: stateData.stateEstateTaxNote || `Yes, ${stateData.name} imposes both an inheritance tax and a separate state estate tax.`,
      }]
      : []),
    ...stateData.faqs,
  ]

  const appSchema = webApplicationSchema(`${stateData.name} Inheritance Tax Calculator 2026`)
  const faqSchemaData = faqSchema(stateFaqs)

  const relatedTools = [
    { label: `${stateData.name} Sales Tax Calculator`, href: `/${slug}/sales-tax` },
    { label: 'Inheritance Tax — All States', href: '/inheritance-tax' },
    { label: `${stateData.name} Property Tax Estimator`, href: `/${slug}/property-tax` },
    ...stateData.relatedTools,
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
          <span className="text-body">Inheritance Tax</span>
        </p>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            {stateData.name} Inheritance Tax Calculator
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            {stateData.customIntro || (
              <>
                {stateData.name} is one of only 5 US states with an inheritance tax. {stateData.exemptionNote}
              </>
            )}
          </p>
        </div>

        {/* Beneficiary class quick reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stateData.beneficiaryClasses.slice(0, 4).map((bc, i) => (
            <div key={i} className="tool-card py-4">
              <p className="text-xs text-muted mb-1 leading-tight">{bc.class}</p>
              <p className="text-lg font-semibold text-primary">
                {bc.rate === 0
                  ? 'Exempt'
                  : bc.rate !== null
                    ? formatPercent(bc.rate)
                    : bc.rateRange
                      ? `${formatPercent(bc.rateRange.min)}–${formatPercent(bc.rateRange.max)}`
                      : 'Varies'}
              </p>
            </div>
          ))}
        </div>

        {/* Calculator */}
        <InheritanceTaxCalculator
          stateData={stateData}
          federal={federal}
          lastUpdated={meta.lastUpdated}
        />

        {/* Disclaimer */}
        <DisclaimerBanner
          lastUpdated={meta.lastUpdated}
          officialSourceUrl={stateData.officialSourceUrl}
          officialSourceLabel={stateData.officialSourceLabel}
        />

        {/* Full beneficiary class table */}
        <div className="tool-card">
          <h2 className="text-base font-semibold text-primary mb-1">
            {stateData.name} inheritance tax by relationship
          </h2>
          <p className="text-sm text-muted mb-4">
            Source: {stateData.officialSourceLabel}.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Relationship', 'Exemption', 'Rate', ''].map((h, i) => (
                    <th key={i} className={`py-2 text-xs font-semibold text-muted uppercase
                        tracking-wider pr-4 last:pr-0 ${i === 0 ? 'text-left' : 'text-right'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stateData.beneficiaryClasses.map((bc, i) => (
                  <tr key={i}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg/60'}`}>
                    <td className="py-2.5 pr-4 font-medium text-body">{bc.class}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-muted">
                      {bc.exemptionAmount ? formatCurrency(bc.exemptionAmount) : bc.exemptionAmount === 0 ? 'None' : '—'}
                    </td>
                    <td className="py-2.5 text-right font-mono text-body">
                      {bc.rate === 0
                        ? '0%'
                        : bc.rate !== null
                          ? formatPercent(bc.rate)
                          : bc.rateRange
                            ? `${formatPercent(bc.rateRange.min)}–${formatPercent(bc.rateRange.max)}`
                            : bc.brackets
                              ? bc.brackets.map((b) => formatPercent(b.rate)).join('–')
                              : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stateData.additionalExemptions && (
            <p className="text-xs text-muted mt-3">{stateData.additionalExemptions}</p>
          )}
        </div>

        {/* FAQ */}
        <FaqAccordion faqs={stateFaqs} />

        {/* Related */}
        <RelatedTools links={relatedTools} />

      </ToolPageLayout>
    </>
  )
}