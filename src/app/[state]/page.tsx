import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStateMeta, getStateData, getAllStateSlugs } from '@/lib/rates'

interface Props {
    params: Promise<{ state: string }>
}

export async function generateStaticParams() {
    return getAllStateSlugs()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { state: slug } = await params
    const meta = getStateMeta(slug)
    if (!meta) return {}

    return {
        title: `${meta.name} Tax Calculators 2026 — simpletaxcalculator.app`,
        description: `Free tax calculators for ${meta.name}. Sales tax, property tax, and more — state-specific rates updated for 2026.`,
    }
}

const TAX_TYPE_LABELS: Record<string, { label: string; description: string }> = {
    'sales-tax': {
        label: 'Sales Tax Calculator',
        description: 'Calculate sales tax by county and city. Includes combined local rates.',
    },
    'property-tax': {
        label: 'Property Tax Estimator',
        description: 'Estimate annual property tax based on assessed value and mill rate.',
    },
    'inheritance-tax': {
        label: 'Inheritance Tax Calculator',
        description: 'Estimate inheritance tax liability based on estate value and relationship.',
    },
    'gas-tax': {
        label: 'Gas Tax Calculator',
        description: 'Calculate state and federal gas tax per gallon and per fill-up.',
    },
    'self-employment-tax': {
        label: 'Self-Employment Tax Calculator',
        description: 'Estimate self-employment tax and quarterly estimated payments.',
    },
    'capital-gains-tax': {
        label: 'Capital Gains Tax Calculator',
        description: 'Calculate short and long-term capital gains tax based on asset sale profits',
    },
}

export default async function StateHubPage({ params }: Props) {
    const { state: slug } = await params
    const meta = getStateMeta(slug)
    const stateFile = getStateData(slug)

    if (!meta || !stateFile) notFound()

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            {/* Breadcrumb */}
            <p className="text-xs text-muted mb-6">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                {' / '}
                <span className="text-body">{meta.name}</span>
            </p>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center
                           text-white text-sm font-bold flex-shrink-0">
                        {meta.abbreviation}
                    </span>
                    <h1 className="text-3xl font-semibold text-primary">
                        {meta.name} Tax Calculators
                    </h1>
                </div>
                <p className="text-muted text-sm leading-relaxed max-w-xl">
                    Free, accurate tax calculators for {meta.name}. All rates sourced from the{' '}
                    {meta.name} Department of Revenue and updated for 2026.
                </p>
            </div>

            {/* Available tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {meta.availableTaxTypes.map((taxType) => {
                    const info = TAX_TYPE_LABELS[taxType]
                    if (!info) return null
                    return (
                        <Link
                            key={taxType}
                            href={`/${slug}/${taxType}`}
                            className="tool-card group hover:border-accent/40 hover:shadow-md
                         transition-all duration-200 flex flex-col"
                        >
                            <h2 className="text-base font-semibold text-primary mb-1
                             group-hover:text-accent transition-colors">
                                {meta.name} {info.label}
                            </h2>
                            <p className="text-sm text-muted leading-relaxed flex-1">
                                {info.description}
                            </p>
                            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent">
                                Open calculator
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                                    className="group-hover:translate-x-0.5 transition-transform">
                                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted leading-relaxed border-t border-border pt-6">
                All calculators are for informational purposes only and do not constitute tax advice.
                Consult a qualified tax professional for your specific situation.
            </p>
        </div>
    )
}