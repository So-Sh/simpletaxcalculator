// app/home-affordability/page.tsx

import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import AssumptionsBanner from '@/components/tax/AssumptionsBanner'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import {
    getAllHomeAffordabilityStates,
    getHomeAffordabilityMeta,
    getMortgageAssumptions,
    getStatesSortedByHomeValueRange,
} from '@/lib/home-affordability'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

export const metadata: Metadata = {
    title: 'Home Affordability Estimator 2026 — All 50 States by County',
    description:
        'Estimate how much home you could afford by county, based on your income, then compare against Zillow\u2019s typical home value for that county. Updated September 2026.',
    openGraph: {
        title: 'Home Affordability Estimator 2026 — All 50 States by County',
        description:
            'Free home affordability estimator using your income, county property tax rates, and Zillow ZHVI benchmarks. All 50 states.',
    },
}

const RELATED_TOOLS = [
    { label: 'Property Tax Estimator', href: '/property-tax' },
    { label: 'Sales Tax Calculator', href: '/sales-tax' },
    { label: 'Capital Gains Calculator', href: '/capital-gains' },
]

function buildFaqs(dtiRatioPct: string) {
    return [
        {
            question: 'Is this a home affordability calculator or an estimator?',
            answer:
                `This is an estimator, not a calculator. It applies a ${dtiRatioPct} housing-cost ratio to your gross annual income, then subtracts an assumed property tax, insurance, and (if applicable) PMI amount to work out an estimated affordable home price. That's a simplified rule of thumb, not a lender's underwriting decision, which is why results are estimates rather than a pre-approval amount.`,
        },
        {
            question: 'Why is this an estimate instead of an exact number?',
            answer:
                `The estimate depends on several assumptions: a national average mortgage rate, a national insurance assumption, a national PMI assumption (for down payments under 20%), and a ${dtiRatioPct} housing-cost ratio applied to gross income only \u2014 existing debts are not factored in. Your county's effective property tax rate is real, county-specific data, but the other inputs are national averages, so your actual affordable price will vary based on your credit, loan type, lender, and personal finances.`,
        },
        {
            question: 'Where does this data come from?',
            answer:
                'Typical home values come from Zillow Research\u2019s Home Value Index (ZHVI), smoothed and seasonally adjusted. Property tax rates come from the U.S. Census Bureau\u2019s American Community Survey, as compiled by the Tax Foundation. The mortgage rate assumption comes from Freddie Mac\u2019s Primary Mortgage Market Survey (PMMS). See the assumptions section above for exact figures and dates.',
        },
        {
            question: 'Why are some counties missing data?',
            answer:
                'A small number of low-population counties aren\u2019t covered by Zillow\u2019s ZHVI dataset, or by the Census Bureau\u2019s property tax sample. These show as \u201cData not available\u201d rather than an inaccurate figure.',
        },
    ]
}

function formatMoney(n: number) {
    return '$' + Math.round(n).toLocaleString()
}

export default function HomeAffordabilityPillarPage() {
    const states = getAllHomeAffordabilityStates()
    const meta = getHomeAffordabilityMeta()
    const assumptions = getMortgageAssumptions()
    const sortedStates = getStatesSortedByHomeValueRange('desc')

    const appSchema = webApplicationSchema('Home Affordability Estimator 2026 — All US States')
    const dtiRatioPct = `${(assumptions.dtiRatio * 100).toFixed(0)}%`
    const faqs = buildFaqs(dtiRatioPct)
    const faqSchemaData = faqSchema(faqs)

    return (
        <>
            <Script id="schema-webapp" type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
            <Script id="schema-faq" type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }} />

            <ToolPageLayout>

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-primary mb-2">Home Affordability Estimator</h1>
                    <p className="text-sm text-muted leading-relaxed max-w-xl">
                        Estimate how much home you could afford based on your income, your county&apos;s
                        property tax rate, and a national mortgage-rate assumption — then compare it
                        against Zillow&apos;s typical home value for that county. This is an estimate,
                        not a precise calculation - see the FAQ below for why.
                    </p>
                </div>

                {/* State grid — no state pre-selected on pillar page, so no income input here yet */}
                <div className="tool-card">
                    <p className="text-sm text-muted mb-4">
                        Select your state below to estimate home affordability by county.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {states.map((state) => (
                            <Link prefetch={false}
                                key={state.slug}
                                href={`/${state.slug}/home-affordability`}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border
                           border-border hover:border-accent/40 hover:bg-bg transition-all group text-sm"
                            >
                                <span className="w-7 h-5 rounded text-center text-xs font-bold
                                 bg-primary/8 text-primary flex items-center justify-center
                                 flex-shrink-0 leading-none">
                                    {state.abbreviation}
                                </span>
                                <span className="font-medium text-body group-hover:text-primary truncate">
                                    {state.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Assumptions — mortgage rate, insurance, PMI, DTI ratio */}
                <AssumptionsBanner
                    mortgageRate={assumptions.rate}
                    rateSource={assumptions.rateSource}
                    rateSourceUrl={assumptions.rateSourceUrl}
                    rateDataAsOf={assumptions.dataAsOf}
                    insuranceAssumptionPct={assumptions.insuranceAssumptionPct}
                    insuranceAssumptionLabel={assumptions.insuranceAssumptionLabel}
                    pmiAssumptionPct={assumptions.pmiAssumptionPct}
                    pmiAssumptionLabel={assumptions.pmiAssumptionLabel}
                    dtiRatio={assumptions.dtiRatio}
                />

                {/* Standard YMYL disclaimer */}
                <DisclaimerBanner
                    lastUpdated={meta.lastUpdated}
                    officialSourceUrl={meta.officialSourceUrl}
                    officialSourceLabel={meta.officialSourceLabel}
                />

                {/* State comparison table — sorted highest to lowest typical home value */}
                <div className="tool-card">
                    <h2 className="text-base font-semibold text-primary mb-1">
                        Typical home value by state — Zillow ZHVI, {meta.dataAsOf}
                    </h2>
                    <p className="text-sm text-muted mb-4">
                        Sorted by each state&apos;s highest-value county. Home values vary significantly
                        by county, so we show the range rather than a single statewide number.
                        Source: {meta.officialSourceLabel}.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    {['State', 'Lowest county', 'Highest county', ''].map((h, i) => (
                                        <th key={i} className={`py-2 text-xs font-semibold text-muted uppercase
                        tracking-wider pr-4 last:pr-0 ${i === 0 ? 'text-left' : i === 3 ? 'text-right' : 'text-right'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStates.map(({ state, range }, i) => (
                                    <tr key={state.slug}
                                        className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg/60'}`}>
                                        <td className="py-2.5 pr-4">
                                            <Link prefetch={false} href={`/${state.slug}/home-affordability`}
                                                className="font-medium text-accent hover:underline underline-offset-2">
                                                {state.name}
                                            </Link>
                                        </td>
                                        <td className="py-2.5 pr-4 text-right">
                                            {range.lowest ? (
                                                <>
                                                    <span className="font-mono text-body">{formatMoney(range.lowest.latestValue as number)}</span>
                                                    <span className="block text-xs text-muted/70 truncate">{range.lowest.name}</span>
                                                </>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="py-2.5 pr-4 text-right">
                                            {range.highest ? (
                                                <>
                                                    <span className="font-mono text-body">{formatMoney(range.highest.latestValue as number)}</span>
                                                    <span className="block text-xs text-muted/70 truncate">{range.highest.name}</span>
                                                </>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="py-2.5 text-right">
                                            <Link prefetch={false} href={`/${state.slug}/home-affordability`}
                                                className="text-xs text-accent hover:underline">
                                                Estimate →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-muted mt-3">
                        Typical home value = Zillow&apos;s smoothed, seasonally adjusted ZHVI for the
                        35th–65th percentile (all-home mid-tier), per county. Not literally the median.
                    </p>
                </div>

                {/* FAQ */}
                <FaqAccordion faqs={faqs} />

                {/* Related tools */}
                <RelatedTools links={RELATED_TOOLS} />

            </ToolPageLayout>
        </>
    )
}