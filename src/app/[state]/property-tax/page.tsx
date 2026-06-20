// app/[state]/property-tax/page.tsx

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import PropertyTaxEstimator from '@/components/tax/PropertyTaxEstimator'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import {
  getStatePropertyTax,
  getAllPropertyTaxStates,
  getPropertyTaxMeta,
  getCountiesSortedByRate,
  getStateRateRange,
} from '@/lib/property-tax'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

interface Props {
  params: Promise<{ state: string }>
}

export async function generateStaticParams() {
  return getAllPropertyTaxStates().map((s) => ({ state: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: slug } = await params
  const stateData = getStatePropertyTax(slug)
  if (!stateData) return {}

  const range = getStateRateRange(stateData)

  return {
    title: `${stateData.name} Property Tax Estimator 2026 — simpletaxcalculator.app`,
    description: `Estimate ${stateData.name} property tax by county. Effective rates range from ${range.lowest ? (range.lowest.medianEffectiveRate * 100).toFixed(2) + '%' : 'N/A'
      } to ${range.highest ? (range.highest.medianEffectiveRate * 100).toFixed(2) + '%' : 'N/A'
      } based on US Census data. Covers ${stateData.countyCount} counties.`,
  }
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatPercent(n: number) {
  return (n * 100).toFixed(2) + '%'
}

function formatMedianTaxPaid(medianTaxPaid: number | null, isFloorValue: boolean) {
  if (medianTaxPaid === null) return 'Data not available'
  if (isFloorValue) return 'Less than $200'
  return formatCurrency(medianTaxPaid)
}

export default async function StatePropertyTaxPage({ params }: Props) {
  const { state: slug } = await params
  const stateData = getStatePropertyTax(slug)
  const meta = getPropertyTaxMeta()

  if (!stateData) notFound()

  const range = getStateRateRange(stateData)
  const sortedCounties = getCountiesSortedByRate(stateData, 'desc')
  const countiesWithoutData = stateData.counties.filter((c) => c.medianEffectiveRate === null)

  // State-specific FAQs, combined with any hand-written FAQs from the JSON
  const stateFaqs = [
    {
      question: `What is the property tax rate in ${stateData.name}?`,
      answer: `${stateData.name}'s effective property tax rate varies significantly by county${range.lowest && range.highest
        ? ` — from about ${formatPercent(range.lowest.medianEffectiveRate)} in ${range.lowest.name} to about ${formatPercent(range.highest.medianEffectiveRate)} in ${range.highest.name}`
        : ''
        }. This is based on the median amount homeowners actually pay relative to their home's value (US Census Bureau, 2024 American Community Survey), not a single statutory rate. Select your county above to see its specific median rate.`,
    },
    ...(range.highest
      ? [{
        question: `What county has the highest property tax rate in ${stateData.name}?`,
        answer: `${range.highest.name} has the highest median effective property tax rate in ${stateData.name}, at approximately ${formatPercent(range.highest.medianEffectiveRate)}. This means homeowners there typically pay about ${formatPercent(range.highest.medianEffectiveRate)} of their home's value in property tax each year, based on US Census Bureau data. Actual bills vary by individual assessment and any exemptions.`,
      }]
      : []),
    ...(range.lowest
      ? [{
        question: `What county has the lowest property tax rate in ${stateData.name}?`,
        answer: `${range.lowest.name} has the lowest median effective property tax rate in ${stateData.name}, at approximately ${formatPercent(range.lowest.medianEffectiveRate)}. This means homeowners there typically pay about ${formatPercent(range.lowest.medianEffectiveRate)} of their home's value in property tax each year, based on US Census Bureau data. Actual bills vary by individual assessment and any exemptions.`,
      }]
      : []),
    {
      question: `Why is this an estimate and not my exact property tax bill?`,
      answer: `Property tax in ${stateData.name}, like everywhere in the US, is calculated using your home's assessed value and the local mill rate set by your county, city, and school district — not a flat statewide percentage. Our estimator uses the county median effective rate (what a typical homeowner actually pays, relative to home value) to give you a reasonable estimate. Your actual bill depends on your specific assessment and any exemptions you qualify for.`,
    },
    ...(countiesWithoutData.length > 0
      ? [{
        question: `Why don't all ${stateData.name} counties show data?`,
        answer: `${countiesWithoutData.length} of ${stateData.countyCount} counties in ${stateData.name} are missing data because the Census Bureau's sample size was too small in those low-population counties to produce a reliable estimate. This is a data availability limit, not an error.`,
      }]
      : []),
    ...stateData.faqs,
  ]

  const appSchema = webApplicationSchema(`${stateData.name} Property Tax Estimator 2026`)
  const faqSchemaData = faqSchema(stateFaqs)

  const relatedTools = [
    { label: `${stateData.name} Sales Tax Calculator`, href: `/${slug}/sales-tax` },
    { label: 'Property Tax — All States', href: '/property-tax' },
    { label: 'Capital Gains Calculator', href: '/capital-gains' },
    { label: 'Gas Tax Calculator', href: '/gas-tax' },
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
          <span className="text-body">Property Tax</span>
        </p>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            {stateData.name} Property Tax Estimator
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            {stateData.customIntro || (
              <>
                Estimate property tax for any county in {stateData.name}, based on median
                effective rates from the US Census Bureau. Covers {stateData.countyCount}{' '}
                counties.
              </>
            )}
          </p>
        </div>

        {/* Rate highlight cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="tool-card text-center py-4">
            <p className="text-xs text-muted mb-1 leading-tight">Lowest county rate</p>
            <p className="text-xl font-semibold text-primary">
              {range.lowest ? formatPercent(range.lowest.medianEffectiveRate) : 'N/A'}
            </p>
            {range.lowest && (
              <p className="text-xs text-muted/70 mt-0.5 truncate">{range.lowest.name}</p>
            )}
          </div>
          <div className="tool-card text-center py-4">
            <p className="text-xs text-muted mb-1 leading-tight">Highest county rate</p>
            <p className="text-xl font-semibold text-primary">
              {range.highest ? formatPercent(range.highest.medianEffectiveRate) : 'N/A'}
            </p>
            {range.highest && (
              <p className="text-xs text-muted/70 mt-0.5 truncate">{range.highest.name}</p>
            )}
          </div>
          <div className="tool-card text-center py-4">
            <p className="text-xs text-muted mb-1 leading-tight">Counties covered</p>
            <p className="text-xl font-semibold text-primary">{stateData.countyCount}</p>
          </div>
          <div className="tool-card text-center py-4">
            <p className="text-xs text-muted mb-1 leading-tight">Data vintage</p>
            <p className="text-xl font-semibold text-muted">2024</p>
          </div>
        </div>

        {/* Estimator */}
        <PropertyTaxEstimator
          counties={stateData.counties}
          stateName={stateData.name}
          lastUpdated={meta.lastUpdated}
        />

        {/* Disclaimer */}
        <DisclaimerBanner
          lastUpdated={meta.lastUpdated}
          officialSourceUrl={meta.officialSourceUrl}
          officialSourceLabel={meta.officialSourceLabel}
        />

        {/* County rate table */}
        <div className="tool-card">
          <h2 className="text-base font-semibold text-primary mb-1">
            {stateData.name} property tax rates by county
          </h2>
          <p className="text-sm text-muted mb-4">
            Sorted highest to lowest median effective rate. Source: {meta.officialSourceLabel}.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['County', 'Median tax paid', 'Median effective rate', 'YoY change'].map((h, i) => (
                    <th key={i} className={`py-2 text-xs font-semibold text-muted uppercase
                        tracking-wider pr-4 last:pr-0 ${i === 0 ? 'text-left' : 'text-right'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedCounties.map((county, i) => (
                  <tr key={county.fips}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg/60'}`}>
                    <td className="py-2.5 pr-4 font-medium text-body">{county.name}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-muted">
                      {formatMedianTaxPaid(county.medianTaxPaid, county.isFloorValue)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-body">
                      {county.medianEffectiveRate !== null
                        ? formatPercent(county.medianEffectiveRate)
                        : 'N/A'}
                    </td>
                    <td className="py-2.5 text-right font-mono text-muted">
                      {county.pctChangeInflationAdjusted !== null
                        ? `${county.pctChangeInflationAdjusted > 0 ? '+' : ''}${county.pctChangeInflationAdjusted.toFixed(1)}%`
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-3">
            Median effective rate = total real estate taxes paid ÷ total home value, for
            owner-occupied housing (2024 American Community Survey). YoY change is the
            inflation-adjusted change in taxes paid, 2023–2024. &quot;N/A&quot; indicates the
            Census Bureau&apos;s sample size was too small for a reliable county-level estimate.
          </p>
        </div>

        {/* FAQ */}
        <FaqAccordion faqs={stateFaqs} />

        {/* Related */}
        <RelatedTools links={relatedTools} />

      </ToolPageLayout>
    </>
  )
}