// components/tax/PropertyTaxEstimator.tsx

'use client'

import { useState } from 'react'
import LastUpdatedBadge from './LastUpdatedBadge'
import type { CountyPropertyTax } from '@/lib/property-tax'

function formatCurrency(n: number) {
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatPercent(n: number) {
    return (n * 100).toFixed(2) + '%'
}

function formatMedianTaxPaid(county: CountyPropertyTax) {
    if (county.medianTaxPaid === null) return 'Data not available'
    if (county.isFloorValue) return 'Less than $200'
    return formatCurrency(county.medianTaxPaid)
}

interface PropertyTaxEstimatorProps {
    counties: CountyPropertyTax[] // empty array = no state pre-selected (pillar page)
    stateName: string | null
    lastUpdated: string
}

export default function PropertyTaxEstimator({
    counties,
    stateName,
    lastUpdated,
}: PropertyTaxEstimatorProps) {
    const countiesWithData = counties.filter((c) => c.medianEffectiveRate !== null)
    const [selectedFips, setSelectedFips] = useState<string>(countiesWithData[0]?.fips ?? '')
    const [homeValue, setHomeValue] = useState<number>(300000)
    const [customValue, setCustomValue] = useState('')
    const [useCustom, setUseCustom] = useState(false)

    const selectedCounty = countiesWithData.find((c) => c.fips === selectedFips) ?? null
    const effectiveHomeValue = useCustom ? parseFloat(customValue) || 0 : homeValue

    const estimatedAnnualTax =
        selectedCounty?.medianEffectiveRate != null
            ? effectiveHomeValue * selectedCounty.medianEffectiveRate
            : null

    const estimatedMonthlyTax = estimatedAnnualTax != null ? estimatedAnnualTax / 12 : null

    const HOME_VALUE_PRESETS = [200000, 300000, 400000, 500000, 750000]

    return (
        <div className="tool-card">

            {/* County selector */}
            <div className="mb-5">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    {stateName ? `${stateName} county` : 'Select a county'}
                </label>
                <select
                    value={selectedFips}
                    onChange={(e) => setSelectedFips(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-body
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                    {countiesWithData.length === 0 && (
                        <option value="">No county data available</option>
                    )}
                    {countiesWithData.map((c) => (
                        <option key={c.fips} value={c.fips}>
                            {c.name} — {formatPercent(c.medianEffectiveRate as number)} median effective rate
                        </option>
                    ))}
                </select>
            </div>

            {/* Home value */}
            <div className="mb-5">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Home value
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                    {HOME_VALUE_PRESETS.map((v) => (
                        <button
                            key={v}
                            onClick={() => { setHomeValue(v); setUseCustom(false) }}
                            className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all text-center
                ${!useCustom && homeValue === v
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-surface text-muted border-border hover:border-primary/40'
                                }`}
                        >
                            {formatCurrency(v)}
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">$</span>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            placeholder="Enter home value"
                            className="w-full rounded-lg border border-border bg-surface pl-6 pr-3 py-2.5 text-sm text-body
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                    </div>
                )}
            </div>

            {/* Rate summary */}
            {selectedCounty && (
                <div className="rounded-lg bg-bg border border-border px-4 py-3 mb-4 text-xs text-muted space-y-1">
                    <div className="flex justify-between">
                        <span>{selectedCounty.name} median effective rate</span>
                        <span className="font-mono text-body">
                            {selectedCounty.medianEffectiveRate != null
                                ? formatPercent(selectedCounty.medianEffectiveRate)
                                : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>County median tax paid (2024)</span>
                        <span className="font-mono text-body">{formatMedianTaxPaid(selectedCounty)}</span>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <LastUpdatedBadge lastUpdated={lastUpdated} />
            </div>

            {/* Results — phrased as an estimate, never "owed" or "due" */}
            {estimatedAnnualTax !== null && (
                <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-4">
                    <p className="text-xs text-muted mb-3">
                        Estimated property tax for a{' '}
                        <strong className="text-body">{formatCurrency(effectiveHomeValue)}</strong> home
                        {selectedCounty ? ` in ${selectedCounty.name}` : ''}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted mb-1">Estimated annual</p>
                            <p className="text-base font-semibold text-accent">{formatCurrency(estimatedAnnualTax)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted mb-1">Estimated monthly</p>
                            <p className="text-base font-semibold text-primary">
                                {formatCurrency(estimatedMonthlyTax as number)}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-muted/70 mt-3 italic">
                        This is an estimate based on the county median effective rate, not a precise tax bill.
                        Your actual property tax depends on your home&apos;s assessed value, local mill rate,
                        and any exemptions you qualify for.
                    </p>
                </div>
            )}
        </div>
    )
}