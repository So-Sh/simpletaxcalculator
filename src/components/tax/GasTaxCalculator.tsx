'use client'

import { useState } from 'react'
import LastUpdatedBadge from './LastUpdatedBadge'
import type { FuelRates } from '@/lib/gas-tax'

// Federal rates — IRS Publication 510, unchanged since 1993
const FEDERAL_EXCISE_GAS_CENTS = 18.4
const FEDERAL_EXCISE_DIESEL_CENTS = 24.4
const FEDERAL_LUST_CENTS = 0.1 // Leaking Underground Storage Tank fee

// Common tank sizes in gallons
const TANK_SIZES = [
    { label: '10 gal (small car)', gallons: 10 },
    { label: '12 gal (compact)', gallons: 12 },
    { label: '15 gal (sedan)', gallons: 15 },
    { label: '18 gal (SUV / truck)', gallons: 18 },
    { label: '20 gal (large truck)', gallons: 20 },
    { label: '25 gal (full-size SUV)', gallons: 25 },
    { label: '30 gal (pickup truck)', gallons: 30 },
]

function formatCents(n: number) {
    return n.toFixed(1) + '¢'
}

function formatCurrency(n: number) {
    return '$' + n.toFixed(2)
}

interface GasTaxCalculatorProps {
    gasoline: FuelRates | null // null = no state pre-selected
    diesel: FuelRates | null
    stateName: string | null
    lastUpdated: string
}

export default function GasTaxCalculator({
    gasoline,
    diesel,
    stateName,
    lastUpdated,
}: GasTaxCalculatorProps) {
    const [fuelType, setFuelType] = useState<'gasoline' | 'diesel'>('gasoline')
    const [rateType, setRateType] = useState<'combined' | 'excise'>('combined')
    const [gallons, setGallons] = useState<number>(15)
    const [customGallons, setCustom] = useState('')
    const [useCustom, setUseCustom] = useState(false)

    const effectiveGallons = useCustom ? parseFloat(customGallons) || 0 : gallons

    const federalExciseCents =
        fuelType === 'gasoline' ? FEDERAL_EXCISE_GAS_CENTS : FEDERAL_EXCISE_DIESEL_CENTS
    const federalTotalCents = federalExciseCents + FEDERAL_LUST_CENTS

    const stateRates = fuelType === 'gasoline' ? gasoline : diesel
    const stateCents =
        stateRates != null
            ? rateType === 'combined'
                ? stateRates.combinedRateCents
                : stateRates.exciseRateCents
            : null

    const federalTax = (federalTotalCents / 100) * effectiveGallons
    const stateTax = stateCents != null ? (stateCents / 100) * effectiveGallons : null
    const combinedTax = stateTax != null ? federalTax + stateTax : federalTax
    const totalCentsPerGal =
        stateCents != null ? federalTotalCents + stateCents : federalTotalCents

    const hasRateDiff =
        stateRates != null &&
        stateRates.combinedRateCents !== stateRates.exciseRateCents

    return (
        <div className="tool-card">

            {/* Fuel type toggle */}
            <div className="mb-5">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Fuel type
                </label>
                <div className="flex gap-3">
                    {(['gasoline', 'diesel'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFuelType(type)}
                            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all capitalize
                ${fuelType === type
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-surface text-muted border-border hover:border-primary/40'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Excise vs combined toggle — only shown when there's a meaningful difference */}
            {stateRates != null && (
                <div className="mb-5">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        State rate type
                    </label>
                    <div className="flex gap-3">
                        {(['combined', 'excise'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setRateType(type)}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                  ${rateType === type
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-surface text-muted border-border hover:border-primary/40'
                                    }`}
                            >
                                {type === 'combined' ? 'Combined (all fees)' : 'Excise only'}
                            </button>
                        ))}
                    </div>
                    {hasRateDiff && (
                        <p className="mt-2 text-xs text-muted">
                            {rateType === 'combined'
                                ? `Includes excise + all state fees and surcharges (${formatCents(stateRates!.combinedRateCents)}/gal).`
                                : `Pure statutory excise tax only, before additional fees (${formatCents(stateRates!.exciseRateCents)}/gal).`}
                        </p>
                    )}
                    {!hasRateDiff && (
                        <p className="mt-2 text-xs text-muted">
                            Excise and combined rates are equal for {stateName ?? 'this state'} — no separate fees apply.
                        </p>
                    )}
                </div>
            )}

            {/* Tank size */}
            <div className="mb-5">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Tank size / gallons
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {TANK_SIZES.map((t) => (
                        <button
                            key={t.gallons}
                            onClick={() => { setGallons(t.gallons); setUseCustom(false) }}
                            className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all text-center
                ${!useCustom && gallons === t.gallons
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-surface text-muted border-border hover:border-primary/40'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setUseCustom(true)}
                        className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all
              ${useCustom
                                ? 'bg-primary text-white border-primary'
                                : 'bg-surface text-muted border-border hover:border-primary/40'
                            }`}
                    >
                        Custom
                    </button>
                </div>
                {useCustom && (
                    <div className="relative mt-2">
                        <input
                            type="number"
                            min="1"
                            step="0.1"
                            value={customGallons}
                            onChange={(e) => setCustom(e.target.value)}
                            placeholder="Enter gallons"
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-body
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                            gallons
                        </span>
                    </div>
                )}
            </div>

            {/* Rate summary */}
            <div className="rounded-lg bg-bg border border-border px-4 py-3 mb-4 text-xs text-muted space-y-1">
                <div className="flex justify-between">
                    <span>Federal {fuelType} excise</span>
                    <span className="font-mono text-body">{formatCents(federalExciseCents)}/gal</span>
                </div>
                <div className="flex justify-between">
                    <span>Federal LUST fee</span>
                    <span className="font-mono text-body">{formatCents(FEDERAL_LUST_CENTS)}/gal</span>
                </div>
                {stateCents != null && (
                    <div className="flex justify-between">
                        <span>
                            {stateName ?? 'State'} {rateType === 'combined' ? 'combined' : 'excise'}
                        </span>
                        <span className="font-mono text-body">{formatCents(stateCents)}/gal</span>
                    </div>
                )}
                {stateRates != null && hasRateDiff && rateType === 'combined' && (
                    <div className="flex justify-between text-muted/70 italic">
                        <span>↳ of which excise</span>
                        <span className="font-mono">{formatCents(stateRates.exciseRateCents)}/gal</span>
                    </div>
                )}
                <div className="flex justify-between font-semibold text-primary border-t border-border pt-1 mt-1">
                    <span>Combined rate</span>
                    <span className="font-mono">{formatCents(totalCentsPerGal)}/gal</span>
                </div>
            </div>

            <div className="mb-4">
                <LastUpdatedBadge lastUpdated={lastUpdated} />
            </div>

            {/* Results */}
            {effectiveGallons > 0 && (
                <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-4">
                    <p className="text-xs text-muted mb-3">
                        Tax on <strong className="text-body">{effectiveGallons} gallons</strong> of{' '}
                        {fuelType}
                        {stateName ? ` in ${stateName}` : ''}
                        {stateRates != null && hasRateDiff && (
                            <span className="ml-1 text-muted/70">
                                ({rateType === 'combined' ? 'all fees' : 'excise only'})
                            </span>
                        )}
                    </p>
                    <div className={`grid gap-4 ${stateTax != null ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <div>
                            <p className="text-xs text-muted mb-1">Federal tax</p>
                            <p className="text-base font-semibold text-accent">{formatCurrency(federalTax)}</p>
                        </div>
                        {stateTax != null && (
                            <div>
                                <p className="text-xs text-muted mb-1">{stateName ?? 'State'} tax</p>
                                <p className="text-base font-semibold text-accent">{formatCurrency(stateTax)}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-muted mb-1">Total tax</p>
                            <p className="text-base font-semibold text-primary">{formatCurrency(combinedTax)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}