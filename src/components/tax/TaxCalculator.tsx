'use client'

import { useState, useCallback } from 'react'
import LastUpdatedBadge from './LastUpdatedBadge'

interface TaxCalculatorProps {
    rates: {
        state: number
        average_combined: number
    }
    counties: { name: string; rate: number }[]
    stateName: string | null   // null = national/pillar page
    lastUpdated: string
}

function formatCurrency(n: number) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatPercent(n: number) {
    return (n * 100).toFixed(3).replace(/\.?0+$/, '') + '%'
}

export default function TaxCalculator({
    rates,
    counties,
    stateName,
    lastUpdated,
}: TaxCalculatorProps) {
    const [price, setPrice] = useState('')
    const [selectedRate, setSelectedRate] = useState(rates.average_combined)
    const [result, setResult] = useState<{ tax: number; total: number } | null>(null)

    const calculate = useCallback(() => {
        const numericPrice = parseFloat(price.replace(/,/g, ''))
        if (isNaN(numericPrice) || numericPrice <= 0) return
        const tax = numericPrice * selectedRate
        setResult({ tax, total: numericPrice + tax })
    }, [price, selectedRate])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') calculate()
    }

    const reset = () => {
        setPrice('')
        setResult(null)
    }

    return (
        <div className="tool-card">
            {/* Rate selector */}
            <div className="mb-5">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    {stateName ? `${stateName} tax rate` : 'Select state / rate'}
                </label>
                <select
                    value={selectedRate}
                    onChange={(e) => {
                        setSelectedRate(parseFloat(e.target.value))
                        setResult(null)
                    }}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-body
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                    <option value={rates.average_combined}>
                        Average combined — {formatPercent(rates.average_combined)}
                    </option>
                    <option value={rates.state}>
                        State rate only — {formatPercent(rates.state)}
                    </option>
                    {counties.map((c) => (
                        <option key={c.name} value={c.rate}>
                            {c.name} — {formatPercent(c.rate)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Price input */}
            <div className="mb-5">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Purchase price ($)
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm select-none">
                        $
                    </span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => {
                            setPrice(e.target.value)
                            setResult(null)
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-border bg-surface pl-7 pr-4 py-2.5 text-sm text-body
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                </div>
            </div>

            {/* CTA row */}
            <div className="flex items-center gap-3 mb-1">
                <button
                    onClick={calculate}
                    className="btn-accent flex-1 text-center text-sm"
                >
                    Calculate tax
                </button>
                {result && (
                    <button
                        onClick={reset}
                        className="text-sm text-muted hover:text-body transition-colors px-3 py-2"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="mb-4">
                <LastUpdatedBadge lastUpdated={lastUpdated} />
            </div>

            {/* Result */}
            {result && (
                <div className="mt-4 rounded-lg bg-primary/5 border border-primary/10 px-4 py-4 grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs text-muted mb-1">Price</p>
                        <p className="text-base font-semibold text-body">
                            {formatCurrency(parseFloat(price))}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted mb-1">Tax</p>
                        <p className="text-base font-semibold text-accent">
                            {formatCurrency(result.tax)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted mb-1">Total</p>
                        <p className="text-base font-semibold text-primary">
                            {formatCurrency(result.total)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}