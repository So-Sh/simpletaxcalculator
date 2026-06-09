import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import GasTaxCalculator from '@/components/tax/GasTaxCalculator'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import { getAllGasTaxStates, getGasTaxMeta, getStatesSortedByCombinedRate } from '@/lib/gas-tax'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

export const metadata: Metadata = {
    title: 'Gas Tax Calculator 2026 — Federal + All 50 States',
    description:
        'Calculate gas tax per gallon and per fill-up for all 50 US states. Federal rate 18.4¢/gal + state combined rates from 9.0¢ (Alaska) to 70.9¢ (California). Updated June 2026.',
    openGraph: {
        title: 'Gas Tax Calculator 2026 — Federal + All 50 States',
        description: 'Free gas tax calculator. Federal 18.4¢/gal + every state rate. Updated 2026.',
    },
}

const FEDERAL_GAS_COMBINED = 18.4 + 0.1  // excise + LUST fee
const FEDERAL_DIESEL_COMBINED = 24.4 + 0.1

const RELATED_TOOLS = [
    { label: 'Sales Tax Calculator', href: '/sales-tax' },
    { label: 'Capital Gains Calculator', href: '/capital-gains' },
    { label: 'Self-Employment Tax Calculator', href: '/self-employment-tax' },
    { label: 'Inheritance Tax Calculator', href: '/inheritance-tax' },
]

function formatCents(n: number) {
    return n.toFixed(1) + '¢'
}

export default function GasTaxPillarPage() {
    const states = getAllGasTaxStates()
    const meta = getGasTaxMeta()
    const sortedStates = getStatesSortedByCombinedRate('gasoline', 'desc')

    const appSchema = webApplicationSchema('Gas Tax Calculator 2026 — All US States')
    const faqSchemaData = faqSchema(meta.faqs)

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
                    <h1 className="text-3xl font-semibold text-primary mb-2">Gas Tax Calculator</h1>
                    <p className="text-sm text-muted leading-relaxed max-w-xl">
                        Calculate how much gas tax you pay per gallon and per fill-up for any US state.
                        Covers federal excise tax plus all 50 state combined rates (excise + all fees).
                        Rates sourced from the U.S. Energy Information Administration, June 2026.
                    </p>
                </div>

                {/* Calculator — no state pre-selected on pillar page */}
                <GasTaxCalculator
                    gasoline={null}
                    diesel={null}
                    stateName={null}
                    lastUpdated={meta.lastUpdated}
                />

                {/* Disclaimer */}
                <DisclaimerBanner
                    lastUpdated={meta.lastUpdated}
                    officialSourceUrl={meta.officialSourceUrl}
                    officialSourceLabel={meta.officialSourceLabel}
                />

                {/* Federal rates reference */}
                <div className="tool-card">
                    <h2 className="text-base font-semibold text-primary mb-4">
                        2026 federal gas tax rates
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            {
                                label: 'Federal gasoline excise tax',
                                rate: '18.4¢ per gallon',
                                sub: 'Unchanged since October 1, 1993. Funds the Highway Trust Fund.',
                            },
                            {
                                label: 'Federal diesel excise tax',
                                rate: '24.4¢ per gallon',
                                sub: 'Unchanged since October 1, 1993. Funds the Highway Trust Fund.',
                            },
                        ].map((item) => (
                            <div key={item.label} className="rounded-lg border border-border bg-bg px-4 py-3">
                                <p className="text-xs text-muted mb-1">{item.label}</p>
                                <p className="text-lg font-semibold text-primary">{item.rate}</p>
                                <p className="text-xs text-muted mt-1">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted mt-3">
                        An additional 0.1¢/gal Leaking Underground Storage Tank (LUST) fee applies to both
                        gasoline and diesel nationwide, bringing the federal combined rate to 18.5¢/gal
                        (gasoline) and 24.5¢/gal (diesel).
                    </p>
                </div>

                {/* State directory */}
                <div className="tool-card">
                    <h2 className="text-base font-semibold text-primary mb-1">
                        Gas tax calculator by state
                    </h2>
                    <p className="text-sm text-muted mb-5">
                        Select your state for a detailed breakdown including per-fill-up cost estimates.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {states.map((state) => (
                            <Link
                                key={state.slug}
                                href={`/${state.slug}/gas-tax`}
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
                                <span className="font-mono text-xs text-muted flex-shrink-0">
                                    {formatCents(state.gasoline.combinedRateCents)}
                                </span>
                            </Link>
                        ))}
                    </div>
                    <p className="text-xs text-muted mt-3">
                        Rates shown are combined state rates (excise + all fees), per EIA January 2026.
                    </p>
                </div>

                {/* State comparison table — sorted highest to lowest combined rate */}
                <div className="tool-card">
                    <h2 className="text-base font-semibold text-primary mb-1">
                        Gas tax rates by state — 2026
                    </h2>
                    <p className="text-sm text-muted mb-4">
                        Sorted highest to lowest combined state gasoline rate. Source: U.S. Energy Information
                        Administration, January 2026.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    {[
                                        { label: 'State', align: 'left' },
                                        { label: 'Gas (excise)', align: 'right' },
                                        { label: 'Gas (combined)', align: 'right' },
                                        { label: 'Diesel (combined)', align: 'right' },
                                        { label: 'Total (gas + federal)', align: 'right' },
                                        { label: '', align: 'right' },
                                    ].map((h, i) => (
                                        <th key={i} className={`py-2 text-xs font-semibold text-muted uppercase
                        tracking-wider pr-4 last:pr-0 text-${h.align}`}>
                                            {h.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStates.map((state, i) => {
                                    const gasHasDiff =
                                        state.gasoline.combinedRateCents !== state.gasoline.exciseRateCents
                                    return (
                                        <tr key={state.slug}
                                            className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg/60'}`}>
                                            <td className="py-2.5 pr-4">
                                                <Link href={`/${state.slug}/gas-tax`}
                                                    className="font-medium text-accent hover:underline underline-offset-2">
                                                    {state.name}
                                                </Link>
                                            </td>
                                            <td className="py-2.5 pr-4 text-right font-mono text-muted">
                                                {formatCents(state.gasoline.exciseRateCents)}
                                            </td>
                                            <td className="py-2.5 pr-4 text-right font-mono text-body">
                                                {formatCents(state.gasoline.combinedRateCents)}
                                                {gasHasDiff && (
                                                    <span className="ml-1 text-muted/60 text-xs">*</span>
                                                )}
                                            </td>
                                            <td className="py-2.5 pr-4 text-right font-mono text-muted">
                                                {formatCents(state.diesel.combinedRateCents)}
                                            </td>
                                            <td className="py-2.5 pr-4 text-right font-mono font-semibold text-primary">
                                                {formatCents(state.gasoline.combinedRateCents + FEDERAL_GAS_COMBINED)}
                                            </td>
                                            <td className="py-2.5 text-right">
                                                <Link href={`/${state.slug}/gas-tax`}
                                                    className="text-xs text-accent hover:underline">
                                                    Calculate →
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-muted mt-3">
                        Combined column includes excise + all state fees and surcharges. * = excise and
                        combined rates differ (e.g. sales tax on fuel, environmental fees). Total column adds
                        federal 18.4¢ excise + 0.1¢ LUST fee. Local/county taxes not included.
                    </p>
                </div>

                {/* FAQ */}
                <FaqAccordion faqs={meta.faqs} />

                {/* Related tools */}
                <RelatedTools links={RELATED_TOOLS} />

            </ToolPageLayout>
        </>
    )
}