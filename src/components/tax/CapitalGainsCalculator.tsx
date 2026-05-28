'use client'

import { useState, useCallback } from 'react'
import LastUpdatedBadge from './LastUpdatedBadge'

// 2026 federal long-term capital gains brackets (IRS Rev. Proc. 2025-32)
const FEDERAL_LT_BRACKETS: Record<string, { rate: number; min: number; max: number }[]> = {
  single: [
    { rate: 0.00, min: 0,      max: 49450 },
    { rate: 0.15, min: 49451,  max: 545500 },
    { rate: 0.20, min: 545501, max: Infinity },
  ],
  married_jointly: [
    { rate: 0.00, min: 0,      max: 98900 },
    { rate: 0.15, min: 98901,  max: 613700 },
    { rate: 0.20, min: 613701, max: Infinity },
  ],
  married_separately: [
    { rate: 0.00, min: 0,      max: 49450 },
    { rate: 0.15, min: 49451,  max: 306850 },
    { rate: 0.20, min: 306851, max: Infinity },
  ],
  head_of_household: [
    { rate: 0.00, min: 0,      max: 66200 },
    { rate: 0.15, min: 66201,  max: 545500 },
    { rate: 0.20, min: 545501, max: Infinity },
  ],
}

// NIIT thresholds (not inflation-adjusted since 2013)
const NIIT_THRESHOLDS: Record<string, number> = {
  single: 200000,
  married_jointly: 250000,
  married_separately: 125000,
  head_of_household: 200000,
}

const FILING_STATUS_LABELS: Record<string, string> = {
  single: 'Single',
  married_jointly: 'Married Filing Jointly',
  married_separately: 'Married Filing Separately',
  head_of_household: 'Head of Household',
}

function formatCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatPercent(n: number) {
  return (n * 100).toFixed(2).replace(/\.?0+$/, '') + '%'
}

function getFederalLTRate(taxableIncome: number, filingStatus: string): number {
  const brackets = FEDERAL_LT_BRACKETS[filingStatus] ?? FEDERAL_LT_BRACKETS.single
  // Capital gains are stacked on top of ordinary income
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.max) return bracket.rate
  }
  return 0.20
}

function getNIIT(gain: number, magi: number, filingStatus: string): number {
  const threshold = NIIT_THRESHOLDS[filingStatus] ?? NIIT_THRESHOLDS.single
  if (magi <= threshold) return 0
  // NIIT applies to the lesser of net investment income or the amount over the threshold
  const amountOverThreshold = magi - threshold
  return Math.min(gain, amountOverThreshold) * 0.038
}

interface CapitalGainsCalculatorProps {
  lastUpdated: string
  stateRate?: number        // optional — null for national pillar page
  stateName?: string | null
  stateNote?: string | null
}

export default function CapitalGainsCalculator({
  lastUpdated,
  stateRate,
  stateName,
  stateNote,
}: CapitalGainsCalculatorProps) {
  const [purchasePrice, setPurchasePrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [taxableIncome, setTaxableIncome] = useState('')
  const [filingStatus, setFilingStatus] = useState('single')
  const [holdingPeriod, setHoldingPeriod] = useState<'long' | 'short'>('long')
  const [result, setResult] = useState<{
    gain: number
    federalRate: number
    federalTax: number
    niit: number
    stateTax: number
    totalTax: number
    effectiveRate: number
  } | null>(null)

  const calculate = useCallback(() => {
    const purchase = parseFloat(purchasePrice.replace(/,/g, ''))
    const sale = parseFloat(salePrice.replace(/,/g, ''))
    const income = parseFloat(taxableIncome.replace(/,/g, ''))

    if (isNaN(purchase) || isNaN(sale) || isNaN(income)) return
    if (sale <= purchase) {
      setResult(null)
      return
    }

    const gain = sale - purchase

    let federalRate: number
    let federalTax: number

    if (holdingPeriod === 'short') {
      // Short-term: taxed as ordinary income — use the top marginal rate
      // Simplified: we show the rate at their income + gain level
      const shortTermBrackets = [
        { rate: 0.10, max: 11925 },
        { rate: 0.12, max: 48475 },
        { rate: 0.22, max: 103350 },
        { rate: 0.24, max: 197300 },
        { rate: 0.32, max: 250525 },
        { rate: 0.35, max: 626350 },
        { rate: 0.37, max: Infinity },
      ]
      const effectiveIncome = income + gain
      federalRate = shortTermBrackets.find(b => effectiveIncome <= b.max)?.rate ?? 0.37
      federalTax = gain * federalRate
    } else {
      // Long-term: use stacking method — ordinary income fills brackets first
      federalRate = getFederalLTRate(income, filingStatus)
      federalTax = gain * federalRate
    }

    // NIIT — MAGI approximated as taxable income + gain for this estimate
    const magi = income + gain
    const niit = holdingPeriod === 'long' ? getNIIT(gain, magi, filingStatus) : 0

    // State tax
    const stateTax = stateRate != null ? gain * stateRate : 0

    const totalTax = federalTax + niit + stateTax
    const effectiveRate = gain > 0 ? totalTax / gain : 0

    setResult({ gain, federalRate, federalTax, niit, stateTax, totalTax, effectiveRate })
  }, [purchasePrice, salePrice, taxableIncome, filingStatus, holdingPeriod, stateRate])

  const reset = () => {
    setPurchasePrice('')
    setSalePrice('')
    setTaxableIncome('')
    setResult(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') calculate()
  }

  return (
    <div className="tool-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

        {/* Filing status */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Filing status
          </label>
          <select
            value={filingStatus}
            onChange={(e) => { setFilingStatus(e.target.value); setResult(null) }}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-body
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            {Object.entries(FILING_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Holding period */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Holding period
          </label>
          <div className="flex gap-3">
            {(['long', 'short'] as const).map((period) => (
              <button
                key={period}
                onClick={() => { setHoldingPeriod(period); setResult(null) }}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  holdingPeriod === period
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-muted border-border hover:border-primary/40'
                }`}
              >
                {period === 'long' ? 'Long-term (over 1 year)' : 'Short-term (1 year or less)'}
              </button>
            ))}
          </div>
        </div>

        {/* Purchase price */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Purchase price ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm select-none">$</span>
            <input
              type="number" min="0" step="1"
              value={purchasePrice}
              onChange={(e) => { setPurchasePrice(e.target.value); setResult(null) }}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-surface pl-7 pr-4 py-2.5 text-sm text-body
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        {/* Sale price */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Sale price ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm select-none">$</span>
            <input
              type="number" min="0" step="1"
              value={salePrice}
              onChange={(e) => { setSalePrice(e.target.value); setResult(null) }}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-surface pl-7 pr-4 py-2.5 text-sm text-body
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        {/* Taxable income */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Your taxable income before this gain ($)
          </label>
          <p className="text-xs text-muted mb-2">
            After standard/itemized deductions. Used to determine your bracket. 2026 standard deduction:
            $16,100 (single) · $32,200 (married jointly) · $24,150 (head of household)
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm select-none">$</span>
            <input
              type="number" min="0" step="1"
              value={taxableIncome}
              onChange={(e) => { setTaxableIncome(e.target.value); setResult(null) }}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-surface pl-7 pr-4 py-2.5 text-sm text-body
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* CTA row */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={calculate} className="btn-accent flex-1 text-center text-sm">
          Calculate capital gains tax
        </button>
        {result && (
          <button onClick={reset} className="text-sm text-muted hover:text-body transition-colors px-3 py-2">
            Reset
          </button>
        )}
      </div>

      <div className="mb-4">
        <LastUpdatedBadge lastUpdated={lastUpdated} />
      </div>

      {/* Results */}
      {result && (
        <div className="mt-4 space-y-3">
          {/* Gain summary */}
          <div className="rounded-lg bg-primary/5 border border-primary/10 px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted mb-1">Capital gain</p>
                <p className="text-base font-semibold text-body">{formatCurrency(result.gain)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">
                  Federal tax ({formatPercent(result.federalRate)})
                </p>
                <p className="text-base font-semibold text-accent">{formatCurrency(result.federalTax)}</p>
              </div>
              {result.niit > 0 && (
                <div>
                  <p className="text-xs text-muted mb-1">NIIT (3.8%)</p>
                  <p className="text-base font-semibold text-accent">{formatCurrency(result.niit)}</p>
                </div>
              )}
              {result.stateTax > 0 && stateName && (
                <div>
                  <p className="text-xs text-muted mb-1">{stateName} state tax</p>
                  <p className="text-base font-semibold text-accent">{formatCurrency(result.stateTax)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="rounded-lg bg-primary border border-primary px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60 mb-1">Total estimated tax owed</p>
              <p className="text-xl font-semibold text-white">{formatCurrency(result.totalTax)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60 mb-1">Effective rate on gain</p>
              <p className="text-lg font-semibold text-accent">{formatPercent(result.effectiveRate)}</p>
            </div>
          </div>

          {/* State note */}
          {stateNote && (
            <p className="text-xs text-muted leading-relaxed bg-bg rounded-lg border border-border px-4 py-3">
              <strong className="text-body">{stateName} note:</strong> {stateNote}
            </p>
          )}

          {/* Short-term notice */}
          {holdingPeriod === 'short' && (
            <p className="text-xs text-muted bg-bg rounded-lg border border-border px-4 py-3">
              Short-term gains are taxed as ordinary income. Consider holding your asset for over 12 months to qualify for the lower long-term rates.
            </p>
          )}
        </div>
      )}
    </div>
  )
}