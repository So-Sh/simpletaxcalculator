import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import TaxCalculator from '@/components/tax/TaxCalculator'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FormulaExplainer from '@/components/tax/FormulaExplainer'
import ExampleScenarios from '@/components/tax/ExampleScenarios'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import { getAllStates } from '@/lib/rates'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

export const metadata: Metadata = {
    title: 'Sales Tax Calculator 2026 — All US States',
    description:
        'Free sales tax calculator for all 50 US states. Instant results with state and local combined rates, county breakdowns, and real purchase examples. Rates updated for 2026.',
    openGraph: {
        title: 'Sales Tax Calculator 2026 — All US States',
        description:
            'Free sales tax calculator for all 50 US states. State and local combined rates, updated for 2026.',
    },
}

// ---------------------------------------------------------------------------
// National-level data — not tied to any state file
// ---------------------------------------------------------------------------

const LAST_UPDATED = 'May 2026'

// Representative rates for the national calculator dropdown
// These give users a quick estimate before they navigate to their state page
const NATIONAL_RATES = { state: 0.055 }
const NATIONAL_RATE_OPTIONS = [
    { name: 'California — est. 8.68%', rate: 0.0868 },
    { name: 'Texas — est. 8.25%', rate: 0.0825 },
    { name: 'Florida — est. 7.01%', rate: 0.0701 },
    { name: 'Ohio — est. 7.22%', rate: 0.0722 },
    { name: 'Arizona — est. 8.37%', rate: 0.0837 },
    { name: 'Pennsylvania — est. 6.34%', rate: 0.0634 },
    { name: 'New York — est. 8.52%', rate: 0.0852 },
    { name: 'Washington — est. 8.93%', rate: 0.0893 },
    { name: 'No sales tax state', rate: 0 },
]

const FAQS = [
    {
        question: 'Which US state has the highest sales tax?',
        answer:
            'California has the highest state-level sales tax rate at 7.25%. When combined with local district taxes, some California cities exceed 10.25%. Tennessee and Louisiana have high combined rates when local taxes are factored in, regularly reaching 9%–10% in major cities.',
    },
    {
        question: 'Which US states have no sales tax?',
        answer:
            'Five states have no statewide sales tax: Alaska, Delaware, Montana, New Hampshire, and Oregon. Alaska is the notable exception — while there is no state-level tax, local municipalities are allowed to impose their own sales taxes, so some Alaskan cities do charge sales tax.',
    },
    {
        question: 'How is sales tax calculated?',
        answer:
            'Sales tax is calculated by multiplying the purchase price by the applicable combined tax rate. For example, a $500 item purchased in a city with an 8.25% combined rate results in $41.25 of tax and a $541.25 total. The rate is the sum of the state rate plus any county and city additions.',
    },
    {
        question: 'What is the difference between state and combined sales tax rate?',
        answer:
            'The state rate is set by the state legislature and applies uniformly across the state. The combined rate includes the state rate plus any additional local taxes added by counties, cities, or special taxing districts. Most shoppers pay the combined rate, which can be significantly higher than the state rate alone.',
    },
    {
        question: 'Is sales tax charged on services?',
        answer:
            'It depends on the state. Most states primarily tax the sale of physical goods and exempt services. However, some states like New Mexico, Hawaii, and South Dakota apply broad taxes that include many services. Digital goods and software-as-a-service are also taxed inconsistently across states.',
    },
    {
        question: 'What is the difference between sales tax and use tax?',
        answer:
            'Sales tax is collected by the retailer at the point of sale and remitted to the state. Use tax is owed by the buyer when they purchase an item from an out-of-state seller who did not collect sales tax — for example, an online purchase shipped from another state. Use tax rates are identical to the sales tax rate in the buyer\'s state and are technically owed even if rarely enforced on individuals.',
    },
    {
        question: 'Do you pay sales tax on groceries?',
        answer:
            'It depends on the state. Most states exempt unprepared groceries from sales tax — including California, Texas, Florida, Ohio, and Pennsylvania. However, states like Tennessee, Alabama, and Mississippi tax groceries at either the full rate or a reduced rate. Prepared food (restaurant meals, ready-to-eat items) is taxable in almost every state.',
    },
]

const RELATED_TOOLS = [
    { label: 'Property Tax Estimator', href: '/property-tax' },
    { label: 'Capital Gains Calculator', href: '/capital-gains' },
    { label: 'Inheritance Tax Calculator', href: '/inheritance-tax' },
    { label: 'Self-Employment Tax Calculator', href: '/self-employment-tax' },
]

// States with no sales tax — shown separately in the directory
const NO_TAX_STATES = [
    { name: 'Alaska', note: 'No state tax (local taxes may apply)', slug: null },
    { name: 'Delaware', note: 'No sales tax', slug: null },
    { name: 'Montana', note: 'No sales tax', slug: null },
    { name: 'New Hampshire', note: 'No sales tax', slug: null },
    { name: 'Oregon', note: 'No sales tax', slug: null },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SalesTaxPillarPage() {
    const states = getAllStates()

    const appSchema = webApplicationSchema('Sales Tax Calculator — All US States')
    const faqSchemaData = faqSchema(FAQS)

    return (
        <>
            <Script
                id="schema-webapp"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
            />
            <Script
                id="schema-faq"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
            />

            <ToolPageLayout>

                {/* Page header */}
                <div>
                    <p className="section-label mb-2">Free · No signup · 2026 rates</p>
                    <h1 className="text-3xl font-semibold text-primary mb-2">
                        Sales Tax Calculator
                    </h1>
                    <p className="text-sm text-muted leading-relaxed max-w-xl">
                        Calculate US sales tax instantly for any state. Select a state rate below
                        for a quick estimate, or choose your state from the directory for exact
                        county-level rates and local breakdowns.
                    </p>
                </div>

                {/* National calculator — uses representative state */}
                <TaxCalculator
                    rates={NATIONAL_RATES}
                    counties={NATIONAL_RATE_OPTIONS}
                    stateName={null}
                    lastUpdated={LAST_UPDATED}
                />

                {/* Disclaimer — immediately below calculator, YMYL required */}
                <DisclaimerBanner lastUpdated={LAST_UPDATED} />

                {/* Formula */}
                <FormulaExplainer
                    formula="Price × combined rate = sales tax owed"
                    example={{ price: 10000, tax: 822, total: 10822 }}
                />

                {/* State directory — links to /[state]/sales-tax */}
                <div className="tool-card">
                    <h2 className="text-base font-semibold text-primary mb-1">
                        Sales tax calculator by state
                    </h2>
                    <p className="text-sm text-muted mb-5">
                        Select your state for exact county rates, real purchase examples,
                        and tax-free weekend dates.
                    </p>

                    {/* States with sales tax */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                        {states.map((state) => (
                            <Link
                                key={state.slug}
                                href={`/${state.slug}/sales-tax`}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border
                           text-sm hover:border-accent/40 hover:bg-bg transition-all group"
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

                    {/* No-tax states — informational, no calculator page */}
                    <div className="border-t border-border pt-4">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                            States with no sales tax
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {NO_TAX_STATES.map((s) => (
                                <div
                                    key={s.name}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg
                             bg-bg border border-border text-sm"
                                >
                                    <span className="font-medium text-body">{s.name}</span>
                                    <span className="text-xs text-muted">{s.note}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* National examples */}
                <ExampleScenarios
                    stateName={null}
                    scenarios={[
                        { label: 'Used car — national average', price: 15000, tax: 1233 },
                        { label: 'New car — national average', price: 35000, tax: 2877 },
                        { label: 'Electronics (laptop)', price: 1200, tax: 98.64 },
                        { label: 'Home appliance', price: 800, tax: 65.76 },
                    ]}
                />

                {/* Quick state comparison table */}
                <div className="tool-card">
                    <h2 className="text-base font-semibold text-primary mb-4">
                        Sales tax rates at a glance
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 pr-4 text-xs font-semibold text-muted
                                 uppercase tracking-wider">State</th>
                                    <th className="text-right py-2 pr-4 text-xs font-semibold text-muted
                                 uppercase tracking-wider">State rate</th>
                                    <th className="text-right py-2 text-xs font-semibold text-muted
                                 uppercase tracking-wider">Avg. combined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'California', slug: 'california', state: 7.25, combined: 8.68 },
                                    { name: 'Texas', slug: 'texas', state: 6.25, combined: 8.25 },
                                    { name: 'Florida', slug: 'florida', state: 6.00, combined: 7.01 },
                                    { name: 'Ohio', slug: 'ohio', state: 5.75, combined: 7.22 },
                                    { name: 'Arizona', slug: 'arizona', state: 5.60, combined: 8.37 },
                                    { name: 'Pennsylvania', slug: 'pennsylvania', state: 6.00, combined: 6.34 },
                                    { name: 'New York', slug: null, state: 4.00, combined: 8.52 },
                                    { name: 'Washington', slug: null, state: 6.50, combined: 8.93 },
                                    { name: 'Tennessee', slug: null, state: 7.00, combined: 9.55 },
                                    { name: 'Louisiana', slug: null, state: 4.45, combined: 9.55 },
                                ].map((row, i) => (
                                    <tr key={row.name}
                                        className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg/60'}`}>
                                        <td className="py-2.5 pr-4">
                                            {row.slug ? (
                                                <Link href={`/${row.slug}/sales-tax`}
                                                    className="text-accent hover:underline underline-offset-2">
                                                    {row.name}
                                                </Link>
                                            ) : (
                                                <span className="text-body">{row.name}</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 pr-4 text-right font-mono text-muted">
                                            {row.state.toFixed(2)}%
                                        </td>
                                        <td className="py-2.5 text-right font-mono font-medium text-primary">
                                            {row.combined.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-muted mt-3">
                        Actual rates vary by county and city.
                        Select a state above for exact local rates.
                    </p>
                </div>

                {/* FAQ */}
                <FaqAccordion faqs={FAQS} />

                {/* Related tools */}
                <RelatedTools links={RELATED_TOOLS} />

            </ToolPageLayout>
        </>
    )
}