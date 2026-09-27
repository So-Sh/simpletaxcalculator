// app/[state]/home-affordability/page.tsx

import type { Metadata } from 'next'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import AssumptionsBanner from '@/components/tax/AssumptionsBanner'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import {
    getAllHomeAffordabilityStates,
    getHomeAffordabilityMeta,
    getMortgageAssumptions,
    getPublishedCountiesForState,
    getStateMeta,
} from '@/lib/home-affordability'
import { webApplicationSchema, faqSchema } from '@/lib/schema'
import { breadcrumbSchema } from '@/lib/breadcrumb-schema'
import { article } from '@/lib/text-utils'

interface PageParams {
    state: string
}

export async function generateStaticParams() {
    // Gated by states-index.json's availableTaxTypes, same as every other
    // tax-type pillar — a state only appears here once deliberately flagged
    // as ready, per CLAUDE.md's "never list a tax type as available if the
    // data object is incomplete" rule.
    return getAllHomeAffordabilityStates().map((s) => ({ state: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
    const { state } = await params
    const stateMeta = getStateMeta(state)
    if (!stateMeta) return {}

    const title = `${stateMeta.name} Home Affordability Estimator 2026 — By County`
    const description = `Estimate how much home you could afford in ${stateMeta.name}, by county, based on your income. Compare against Zillow's typical home value for each county.`

    return {
        title,
        description,
        openGraph: { title, description },
    }
}

function buildFaqs(stateName: string, dtiRatioPct: string) {
    return [
        {
            question: `Is this ${article(stateName)} ${stateName} home affordability calculator or an estimator?`,
            answer:
                `This is an estimator, not a calculator. It applies a ${dtiRatioPct} housing-cost ratio to your gross annual income, then subtracts an assumed property tax, insurance, and (if applicable) PMI amount to work out an estimated affordable home price for the county you select. That's a simplified rule of thumb, not a lender's underwriting decision.`,
        },
        {
            question: 'Why is this an estimate instead of an exact number?',
            answer:
                `Each county's effective property tax rate is real, county-specific data. The mortgage rate, insurance, and PMI figures are national assumptions, and the ${dtiRatioPct} ratio applies to gross income only \u2014 existing debts aren't factored in.`,
        },
        {
            question: `Why don't I see every ${stateName} county listed?`,
            answer:
                `We're rolling this out county by county rather than publishing all of them at once, prioritizing counties with the most search demand first. If your county isn't listed yet, check back \u2014 more are added over time.`,
        },
    ]
}

function formatMoney(n: number) {
    return '$' + Math.round(n).toLocaleString()
}

function formatSignedPercent(n: number) {
    return (n >= 0 ? '+' : '') + (n * 100).toFixed(1) + '%'
}

export default async function StateHomeAffordabilityPage({ params }: { params: Promise<PageParams> }) {
    const { state } = await params
    const stateMeta = getStateMeta(state)
    if (!stateMeta) notFound()

    const meta = getHomeAffordabilityMeta()
    const assumptions = getMortgageAssumptions()
    const counties = getPublishedCountiesForState(state)
    const dtiRatioPct = `${(assumptions.dtiRatio * 100).toFixed(0)}%`
    const faqs = buildFaqs(stateMeta.name, dtiRatioPct)

    const appSchema = webApplicationSchema(`Home Affordability Estimator — ${stateMeta.name}`)
    const faqSchemaData = faqSchema(faqs)
    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: stateMeta.name, href: `/${state}` },
        { label: 'Home Affordability' },
    ]
    const breadcrumbSchemaData = breadcrumbSchema(breadcrumbItems)

    return (
        <>
            <Script id="schema-webapp" type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
            <Script id="schema-faq" type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }} />
            <Script id="schema-breadcrumb" type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchemaData) }} />

            <ToolPageLayout>

                <Breadcrumbs items={breadcrumbItems} />

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-primary mb-2">
                        {stateMeta.name} Home Affordability Estimator
                    </h1>
                    <p className="text-sm text-muted leading-relaxed max-w-xl">
                        Estimate how much home you could afford in {stateMeta.name}, by county, based
                        on your income and that county&apos;s property tax rate — then compare it
                        against Zillow&apos;s typical home value for the area.
                    </p>
                </div>

                {/* County grid — no county pre-selected yet */}
                <div className="tool-card">
                    {counties.length > 0 ? (
                        <>
                            <p className="text-sm text-muted mb-4">
                                Select a county below to estimate home affordability.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {counties.map((county) => (
                                    <Link prefetch={false}
                                        key={county.fips}
                                        href={`/${state}/home-affordability/${county.slug}`}
                                        className="flex items-center px-3 py-2.5 rounded-lg border
                               border-border hover:border-accent/40 hover:bg-bg transition-all group text-sm"
                                    >
                                        <span className="font-medium text-body group-hover:text-primary truncate">
                                            {county.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted">
                            County pages for {stateMeta.name} are coming soon.
                        </p>
                    )}
                </div>

                {/* Assumptions */}
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

                {/* County table — typical home value, sorted by SizeRank (largest first) */}
                {counties.length > 0 && (
                    <div className="tool-card">
                        <h2 className="text-base font-semibold text-primary mb-1">
                            {stateMeta.name} counties by typical home value — Zillow ZHVI, {meta.dataAsOf}
                        </h2>
                        <p className="text-sm text-muted mb-4">
                            Source: {meta.officialSourceLabel}.
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        {['County', 'Typical home value', '1-year change', ''].map((h, i) => (
                                            <th key={i} className={`py-2 text-xs font-semibold text-muted uppercase
                            tracking-wider pr-4 last:pr-0 ${i === 0 ? 'text-left' : i === 3 ? 'text-right' : 'text-right'}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {counties.map((county, i) => (
                                        <tr key={county.fips}
                                            className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg/60'}`}>
                                            <td className="py-2.5 pr-4">
                                                <Link prefetch={false}
                                                    href={`/${state}/home-affordability/${county.slug}`}
                                                    className="font-medium text-accent hover:underline underline-offset-2">
                                                    {county.name}
                                                </Link>
                                            </td>
                                            <td className="py-2.5 pr-4 text-right font-mono text-body">
                                                {county.latestValue !== null ? formatMoney(county.latestValue) : 'N/A'}
                                            </td>
                                            <td className="py-2.5 pr-4 text-right font-mono text-body">
                                                {county.oneYearChangePct !== null
                                                    ? formatSignedPercent(county.oneYearChangePct)
                                                    : 'N/A'}
                                            </td>
                                            <td className="py-2.5 text-right">
                                                <Link prefetch={false}
                                                    href={`/${state}/home-affordability/${county.slug}`}
                                                    className="text-xs text-accent hover:underline">
                                                    Estimate →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* FAQ */}
                <FaqAccordion faqs={faqs} />

                {/* Related tools */}
                <RelatedTools
                    links={[
                        { label: `${stateMeta.name} Property Tax Estimator`, href: `/${state}/property-tax` },
                        { label: 'Capital Gains Tax Calculator', href: '/capital-gains' },
                    ]}
                />

            </ToolPageLayout>
        </>
    )
}