// app/property-tax/page.tsx

import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import PropertyTaxEstimator from '@/components/tax/PropertyTaxEstimator'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import {
    getAllPropertyTaxStates,
    getPropertyTaxMeta,
    getStatesSortedByRateRange,
} from '@/lib/property-tax'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

export const metadata: Metadata = {
    title: 'Property Tax Estimator 2026 — All 50 States by County',
    description:
        'Estimate property tax by county for any US state, based on US Census Bureau median effective rates. Updated June 2026.',
    openGraph: {
        title: 'Property Tax Estimator 2026 — All 50 States by County',
        description: 'Free property tax estimator using Census ACS county-level data. All 50 states.',
    },
}

const RELATED_TOOLS = [
    { label: 'Sales Tax Calculator', href: '/sales-tax' },
    { label: 'Gas Tax Calculator', href: '/gas-tax' },
    { label: 'Capital Gains Calculator', href: '/capital-gains' },
]

const PILLAR_FAQS = [
    {
        question: 'Is this a property tax calculator or an estimator?',
        answer:
            'This is an estimator, not a calculator. It uses the median effective property tax rate paid by homeowners in each county (US Census Bureau, 2024 American Community Survey) applied to a home value you enter. This is different from a precise calculation using your actual assessed value and local mill rate, which is why results are estimates, not your exact tax bill.',
    },
    {
        question: 'Why is this an estimate instead of an exact number?',
        answer:
            'Property tax is set locally based on your home\u2019s assessed value, the local mill rate, and any exemptions you qualify for (homestead, senior, veteran, etc.). Our data reflects the county median effective rate \u2014 what a typical homeowner actually pays relative to home value \u2014 not your specific assessment. Two homes of the same value in the same county can have different actual tax bills.',
    },
    {
        question: 'Where does the property tax data come from?',
        answer:
            'Data comes from the U.S. Census Bureau\u2019s 2024 American Community Survey (tables B25103, B25082, B25090), as compiled by the Tax Foundation. It covers 3,144 counties across all 50 states and Washington, D.C.',
    },
    {
        question: 'Why are some counties missing data?',
        answer:
            'A small number of low-population counties are excluded because the Census Bureau\u2019s sample size was too small to produce a reliable estimate. These show as \u201cData not available\u201d rather than an inaccurate figure.',
    },
]

function formatPercent(n: number) {
    return (n * 100).toFixed(2) + '%'
}

export default function PropertyTaxPillarPage() {
    const states = getAllPropertyTaxStates()
    const meta = getPropertyTaxMeta()
    const sortedStates = getStatesSortedByRateRange('desc')

    const appSchema = webApplicationSchema('Property Tax Estimator 2026 — All US States')
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
                    <p className="section-label mb-2">Free · No signup · 2024 Census data</p>
                    <h1 className="text-3xl font-semibold text-primary mb-2">Property Tax Estimator</h1>
                    <p className="text-sm text-muted leading-relaxed max-w-xl">
                        Estimate your property tax by county for any US state, based on median effective
                        rates from the U.S. Census Bureau&apos;s American Community Survey. Covers 3,144
                        counties nationwide. This is an estimate, not a precise calculation - see the FAQ
                        below for why.
                    </p>
                </div>

                {/* Estimator — no state pre-selected on pillar page, so no counties to show yet */}
                <div className="tool-card">
                    <p className="text-sm text-muted mb-4">
                        Select your state below to estimate property tax by county.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {states.map((state) => (
                            <Link
                                key={state.slug}
                                href={`/${state.slug}/property-tax`}
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

                {/* Disclaimer */}
                <DisclaimerBanner
                    lastUpdated={meta.lastUpdated}
                    officialSourceUrl={meta.officialSourceUrl}
                    officialSourceLabel={meta.officialSourceLabel}
                />

                {/* State comparison table — sorted highest to lowest median effective rate */}
                <div className="tool-card">
                    <h2 className="text-base font-semibold text-primary mb-1">
                        Property tax rates by state — Latest ACS 1-year estimates
                    </h2>
                    <p className="text-sm text-muted mb-4">
                        Sorted by each state&apos;s highest-taxed county (median effective rate). Property tax
                        varies significantly by county, so we show the range rather than a single statewide
                        number. Source: {meta.officialSourceLabel}.
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
                                            <Link href={`/${state.slug}/property-tax`}
                                                className="font-medium text-accent hover:underline underline-offset-2">
                                                {state.name}
                                            </Link>
                                        </td>
                                        <td className="py-2.5 pr-4 text-right">
                                            {range.lowest ? (
                                                <>
                                                    <span className="font-mono text-body">{formatPercent(range.lowest.medianEffectiveRate)}</span>
                                                    <span className="block text-xs text-muted/70 truncate">{range.lowest.name}</span>
                                                </>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="py-2.5 pr-4 text-right">
                                            {range.highest ? (
                                                <>
                                                    <span className="font-mono text-body">{formatPercent(range.highest.medianEffectiveRate)}</span>
                                                    <span className="block text-xs text-muted/70 truncate">{range.highest.name}</span>
                                                </>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="py-2.5 text-right">
                                            <Link href={`/${state.slug}/property-tax`}
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
                        Median effective rate = total real estate taxes paid \u00f7 total home value, for
                        owner-occupied housing, per county. Excludes business and rental property.
                    </p>
                </div>

                {/* FAQ */}
                <FaqAccordion faqs={PILLAR_FAQS} />

                {/* Related tools */}
                <RelatedTools links={RELATED_TOOLS} />

            </ToolPageLayout>
        </>
    )
}