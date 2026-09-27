// app/[state]/home-affordability/[county]/page.tsx

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
import CountyAffordabilityContent from '@/components/tax/CountyAffordabilityContent'
import {
    getCountyAffordabilityData,
    getHomeAffordabilityMeta,
    getMortgageAssumptions,
    getHomeAffordabilityRouteParams,
    getNationalMedianHomeValue,
} from '@/lib/home-affordability'
import { requiredIncomeForPrice, type AffordabilityAssumptions } from '@/lib/home-affordability-math'
import { webApplicationSchema, faqSchema } from '@/lib/schema'
import { breadcrumbSchema } from '@/lib/breadcrumb-schema'
import { article } from '@/lib/text-utils'

interface PageParams {
    state: string
    county: string
}

export async function generateStaticParams() {
    return getHomeAffordabilityRouteParams()
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
    const { state, county } = await params
    const data = getCountyAffordabilityData(state, county)
    if (!data) return {}

    const title = `Home Affordability in ${data.countyName}, ${data.stateAbbreviation} — 2026 Estimator`
    const description = `Estimate how much home you could afford in ${data.countyName}, ${data.stateName}, based on your income, then compare against Zillow's typical home value for the county.`

    return {
        title,
        description,
        openGraph: { title, description },
    }
}

function formatMoney(n: number) {
    return '$' + Math.round(n).toLocaleString()
}

type CostBracket = 'high' | 'mid' | 'low'

/**
 * Buckets a county relative to the national median ZHVI value. Thresholds
 * are a starting heuristic (1.5x / 0.6x median) — tune once you have real
 * distribution data across published counties.
 */
function getCostBracket(countyValue: number, nationalMedian: number): CostBracket {
    const ratio = countyValue / nationalMedian
    if (ratio >= 1.5) return 'high'
    if (ratio <= 0.6) return 'low'
    return 'mid'
}

function buildFaqs(
    countyName: string,
    stateName: string,
    dtiRatioPct: string,
    bracket: CostBracket | null,
    requiredIncomeForTypicalHome: number | null
) {
    const faqs = [
        {
            question: `Is this ${article(countyName)} ${countyName} home affordability calculator or an estimator?`,
            answer:
                `This is an estimator, not a calculator. It applies a ${dtiRatioPct} housing-cost ratio to your gross annual income, then subtracts an assumed property tax, insurance, and (if applicable) PMI amount to work out an estimated affordable home price for ${countyName}, ${stateName}. That's a simplified rule of thumb, not a lender's underwriting decision.`,
        },
        {
            question: 'Why is this an estimate instead of an exact number?',
            answer:
                `${countyName}'s effective property tax rate is real, county-specific data. The mortgage rate, insurance, and PMI figures are national assumptions, and the ${dtiRatioPct} ratio applies to gross income only \u2014 existing debts aren't factored in. Your actual affordable price will vary based on your credit, loan type, lender, and personal finances.`,
        },
        {
            question: 'Where does this data come from?',
            answer:
                `${countyName}'s typical home value comes from Zillow Research's Home Value Index (ZHVI). Its property tax rate comes from the U.S. Census Bureau's American Community Survey, as compiled by the Tax Foundation. The mortgage rate assumption comes from Freddie Mac's Primary Mortgage Market Survey (PMMS).`,
        },
    ]

    if (bracket === 'high') {
        faqs.push({
            question: `Why are home prices so far above the affordable range in ${countyName}?`,
            answer:
                `${countyName}'s typical home value is well above the national median. High-cost counties like this typically have housing supply that hasn't kept pace with demand, which pushes prices above what a household earning a typical income can afford at conventional lending ratios. That gap between typical income and typical home price is real and shows up directly in the estimate above.`,
        })
    } else if (bracket === 'low' && requiredIncomeForTypicalHome !== null) {
        faqs.push({
            question: `Is ${formatMoney(requiredIncomeForTypicalHome)} considered a strong income for buying a home in ${countyName}?`,
            answer:
                `${countyName}'s typical home value is below the national median, so the income needed to afford it \u2014 roughly ${formatMoney(requiredIncomeForTypicalHome)} at a ${dtiRatioPct} housing-cost ratio \u2014 tends to be lower than in many other counties nationwide. What counts as a "strong" income still depends on your local job market and cost of living beyond housing.`,
        })
    }

    return faqs
}

export default async function CountyHomeAffordabilityPage({ params }: { params: Promise<PageParams> }) {
    const { state, county } = await params
    const data = getCountyAffordabilityData(state, county)
    if (!data) notFound()

    const meta = getHomeAffordabilityMeta()
    const assumptions = getMortgageAssumptions()
    const dtiRatioPct = `${(assumptions.dtiRatio * 100).toFixed(0)}%`.trim()

    let bracket: CostBracket | null = null
    let requiredIncomeForTypicalHome: number | null = null
    if (data.zhvi.latestValue !== null && data.propertyTaxRatePct !== null) {
        const nationalMedian = getNationalMedianHomeValue()
        if (nationalMedian !== null) {
            bracket = getCostBracket(data.zhvi.latestValue, nationalMedian)
        }
        if (bracket === 'low') {
            const mathAssumptions: AffordabilityAssumptions = {
                mortgageRate: assumptions.rate,
                propertyTaxRate: data.propertyTaxRatePct,
                insuranceAssumptionPct: assumptions.insuranceAssumptionPct,
                pmiAssumptionPct: assumptions.pmiAssumptionPct,
                dtiRatio: assumptions.dtiRatio,
            }
            requiredIncomeForTypicalHome = requiredIncomeForPrice(
                data.zhvi.latestValue,
                assumptions.downPaymentOptionsPct[0],
                mathAssumptions
            ).requiredAnnualIncome
        }
    }
    const faqs = buildFaqs(data.countyName, data.stateName, dtiRatioPct, bracket, requiredIncomeForTypicalHome)

    const appSchema = webApplicationSchema(
        `Home Affordability Estimator — ${data.countyName}, ${data.stateAbbreviation}`
    )
    const faqSchemaData = faqSchema(faqs)
    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: data.stateName, href: `/${data.stateSlug}` },
        { label: 'Home Affordability', href: `/${data.stateSlug}/home-affordability` },
        { label: data.countyName },
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
                        How Much House Can I Afford in {data.countyName}, {data.stateName}?
                    </h1>
                    <p className="text-sm text-muted leading-relaxed max-w-xl">
                        Estimate how much home you could afford based on your household income,
                        down payment, mortgage rate, property taxes, and homeowners insurance —
                        then compare it against {data.countyName}&apos;s typical home value.
                    </p>
                </div>

                {/* Calculator + benchmark + income-needed + property tax cross-link */}
                <CountyAffordabilityContent county={data} assumptions={assumptions} />

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

                {/* Formula section — exposes the actual math, per CLAUDE.md's formula-section rule */}
                <div className="tool-card">
                    <h2 className="text-base font-semibold text-primary mb-2">How we estimate this</h2>
                    <p className="text-sm text-body font-mono leading-relaxed">
                        annual income × {dtiRatioPct} = maximum monthly housing payment<br />
                        − estimated property tax − insurance − PMI (if down payment &lt; 20%)<br />
                        = available principal &amp; interest → estimated affordable home price
                    </p>
                    <p className="text-xs text-muted mt-3">
                        The {dtiRatioPct} ratio is a simplified rule of thumb, not an underwriting model —
                        it doesn&apos;t account for other debt, credit score, HOA, utilities,
                        maintenance, or lender-specific requirements. No debt-to-income input is
                        used; the ratio applies to gross household income only.
                    </p>
                </div>

                {/* FAQ — varies by cost bracket, see buildFaqs */}
                <FaqAccordion faqs={faqs} />

                {/* Related tools */}
                <RelatedTools
                    links={[
                        { label: `${data.stateName} Property Tax Estimator`, href: `/${data.stateSlug}/property-tax` },
                        { label: `${data.stateName} Home Affordability Estimator`, href: `/${data.stateSlug}/home-affordability` },
                    ]}
                />

            </ToolPageLayout>
        </>
    )
}