// app/inheritance-tax/page.tsx

import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import InheritanceTaxCalculator from '@/components/tax/InheritanceTaxCalculator'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import { getAllInheritanceTaxStates, getInheritanceTaxMeta, getFederalEstateTax } from '@/lib/inheritance-tax'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Inheritance Tax Calculator 2026 — All 5 States + Federal Estate Tax',
  description:
    'Calculate inheritance tax for Pennsylvania, New Jersey, Kentucky, Nebraska, and Maryland — the only 5 US states with an inheritance tax. Plus federal estate tax for every state. Updated June 2026.',
  openGraph: {
    title: 'Inheritance Tax Calculator 2026 — All 5 States + Federal Estate Tax',
    description: 'Free inheritance tax calculator covering all 5 inheritance-tax states and federal estate tax.',
  },
}

const RELATED_TOOLS = [
  { label: 'Sales Tax Calculator', href: '/sales-tax' },
  { label: 'Property Tax Estimator', href: '/property-tax' },
  { label: 'Capital Gains Calculator', href: '/capital-gains' },
]

const PILLAR_FAQS = [
  {
    question: 'Which states have an inheritance tax?',
    answer:
      'Only 5 US states currently impose an inheritance tax: Pennsylvania, New Jersey, Kentucky, Nebraska, and Maryland. Iowa repealed its inheritance tax effective January 1, 2025. Every other state has no inheritance tax at all — but residents of any state can still owe federal estate tax if the estate is large enough, and can owe another state\'s inheritance tax if they inherit from someone who lived in or owned property in one of the 5 states listed above.',
  },
  {
    question: 'What is the difference between inheritance tax and estate tax?',
    answer:
      'Estate tax is paid by the estate itself, before assets are distributed, based on the total value of everything the deceased person owned. Inheritance tax is paid by each individual beneficiary, based on what they personally receive and their relationship to the deceased. The federal government only levies an estate tax (no federal inheritance tax exists). Maryland is the only state that levies both.',
  },
  {
    question: 'Do I owe inheritance tax if my state doesn\'t have one?',
    answer:
      'Possibly, in two scenarios. First, if you inherit property located in one of the 5 inheritance-tax states (Pennsylvania, New Jersey, Kentucky, Nebraska, Maryland) — such as real estate — that state\'s inheritance tax can apply to you even if you live elsewhere. Second, federal estate tax can apply to any estate above the federal exemption ($15 million per individual for 2026), regardless of which state the deceased lived in.',
  },
  {
    question: 'Does my spouse have to pay inheritance tax?',
    answer:
      'In all 5 inheritance-tax states, a surviving spouse is fully exempt from inheritance tax, regardless of how much they inherit. This is the one beneficiary class that is universally exempt across every state that levies the tax.',
  },
]

export default function InheritanceTaxPillarPage() {
  const states = getAllInheritanceTaxStates()
  const meta = getInheritanceTaxMeta()
  const federal = getFederalEstateTax()

  const appSchema = webApplicationSchema('Inheritance Tax Calculator 2026 — All US States')
  const faqSchemaData = faqSchema(PILLAR_FAQS)

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
          <h1 className="text-3xl font-semibold text-primary mb-2">Inheritance Tax Calculator</h1>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            Only 5 US states levy an inheritance tax: Pennsylvania, New Jersey, Kentucky, Nebraska,
            and Maryland. Calculate what you&apos;d owe in any of them, or use the federal estate tax
            calculator below — which applies in every state, regardless of where you live.
          </p>
        </div>

        {/* Calculator — federal mode by default on the pillar page */}
        <InheritanceTaxCalculator
          stateData={null}
          federal={federal}
          lastUpdated={meta.lastUpdated}
        />

        {/* Disclaimer */}
        <DisclaimerBanner
          lastUpdated={meta.lastUpdated}
          officialSourceUrl={federal.sourceUrl}
          officialSourceLabel={meta.officialSourceLabel}
        />

        {/* The 5 real inheritance-tax states */}
        <div className="tool-card">
          <h2 className="text-base font-semibold text-primary mb-1">
            The 5 states with an inheritance tax
          </h2>
          <p className="text-sm text-muted mb-4">
            Select a state for its specific beneficiary classes, rates, and exemptions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {states.map((state) => (
              <Link
                key={state.slug}
                href={`/${state.slug}/inheritance-tax`}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border
                           border-border hover:border-accent/40 hover:bg-bg transition-all group text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded text-center text-xs font-bold
                                   bg-primary/8 text-primary flex items-center justify-center
                                   flex-shrink-0 leading-none">
                    {state.abbreviation}
                  </span>
                  <span className="font-medium text-body group-hover:text-primary truncate">
                    {state.name}
                  </span>
                </div>
                <span className="text-xs text-accent flex-shrink-0">Calculate →</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Every other state — single section, NOT 44 separate pages.
            See CLAUDE.md "Tax types — current status" for the duplicate-content
            rationale behind this decision. */}
        <div className="tool-card">
          <h2 className="text-base font-semibold text-primary mb-1">
            What if my state doesn&apos;t have an inheritance tax?
          </h2>
          <p className="text-sm text-muted mb-4">
            45 states have no inheritance tax at all. If you live in any state not listed above,
            you don&apos;t owe state inheritance tax — but two things can still apply to you:
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-bg px-4 py-3">
              <p className="text-sm font-medium text-body mb-1">Federal estate tax (applies everywhere)</p>
              <p className="text-xs text-muted leading-relaxed">
                Federal estate tax applies regardless of which state the deceased lived in, but only
                to estates above {`$${(federal.exemptionPerIndividual / 1000000).toFixed(0)}`} million
                per individual for 2026. Use the federal calculator above to check your exposure.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-bg px-4 py-3">
              <p className="text-sm font-medium text-body mb-1">Inheriting from someone in a different state</p>
              <p className="text-xs text-muted leading-relaxed">
                If you inherit property — especially real estate — located in Pennsylvania,
                New Jersey, Kentucky, Nebraska, or Maryland, that state&apos;s inheritance tax can
                apply to you even if you live in a state with no inheritance tax at all. The tax
                follows the property and the decedent&apos;s residence, not your own state of residence.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <FaqAccordion faqs={PILLAR_FAQS} />

        {/* Related tools */}
        <RelatedTools links={RELATED_TOOLS} />

      </ToolPageLayout>
    </>
  )
}