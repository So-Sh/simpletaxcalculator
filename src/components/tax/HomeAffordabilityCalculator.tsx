'use client'

// components/tax/HomeAffordabilityCalculator.tsx
//
// Interactive estimator: user enters income, picks 20%/10% down payment,
// gets an estimated affordable home price. All assumptions (rate, tax,
// insurance, PMI, DTI) are pre-populated props from the page, not user
// input — this stays a bounded estimator, not a general mortgage calculator.
//
// Deliberately has no idea what Zillow or ZHVI is. The page-level component
// (CountyAffordabilityContent) is responsible for combining this result
// with the county's ZHVI benchmark, calling lib/home-affordability-math.ts
// directly for the reverse (price -> income) calculation. Keeping that
// combination out of this component is what lets it be reused anywhere a
// bare affordability estimate is needed, and keeps "components are logic,
// pages are layout" intact.

import { useEffect, useMemo, useState } from 'react'
import {
    solveAffordablePrice,
    type AffordabilityAssumptions,
    type AffordablePriceResult,
} from '@/lib/home-affordability-math'

interface HomeAffordabilityCalculatorProps {
    countyName: string
    propertyTaxRatePct: number
    mortgageRate: number
    rateSource: string
    rateDataAsOf: string
    insuranceAssumptionPct: number
    pmiAssumptionPct: number
    downPaymentOptionsPct: number[]
    dtiRatio: number
    /** Controlled down payment selection. Omit to let the component manage its own state. */
    downPaymentPct?: number
    /** Required when downPaymentPct is controlled — called when the user toggles it. */
    onDownPaymentPctChange?: (pct: number) => void
    /** Fires whenever the computed result changes, so a parent (e.g. CountyAffordabilityContent) can reuse the same income/result for a benchmark comparison without duplicating input state. */
    onResult?: (result: AffordablePriceResult | null, context: { income: number | null; downPaymentPct: number }) => void
    /** Pre-populates the income field so the page has real, county-specific
        numbers on initial (server) render instead of an empty prompt state.
        User can still edit or clear it. */
    defaultIncome?: number
}

function formatMoney(n: number) {
    return '$' + Math.round(n).toLocaleString()
}

function formatPercent(n: number) {
    return (n * 100).toFixed(2) + '%'
}

export default function HomeAffordabilityCalculator({
    countyName,
    propertyTaxRatePct,
    mortgageRate,
    rateSource,
    rateDataAsOf,
    insuranceAssumptionPct,
    pmiAssumptionPct,
    downPaymentOptionsPct,
    dtiRatio,
    downPaymentPct: controlledDownPaymentPct,
    onDownPaymentPctChange,
    onResult,
    defaultIncome,
}: HomeAffordabilityCalculatorProps) {
    const [incomeInput, setIncomeInput] = useState(defaultIncome ? String(defaultIncome) : '')
    const [internalDownPaymentPct, setInternalDownPaymentPct] = useState(downPaymentOptionsPct[0])

    const downPaymentPct = controlledDownPaymentPct ?? internalDownPaymentPct
    const setDownPaymentPct = (pct: number) => {
        if (onDownPaymentPctChange) onDownPaymentPctChange(pct)
        else setInternalDownPaymentPct(pct)
    }

    const income = Number(incomeInput)
    const hasValidIncome = incomeInput.trim() !== '' && income > 0

    const assumptions: AffordabilityAssumptions = {
        mortgageRate,
        propertyTaxRate: propertyTaxRatePct,
        insuranceAssumptionPct,
        pmiAssumptionPct,
        dtiRatio,
    }

    const result = useMemo(() => {
        if (!hasValidIncome) return null
        return solveAffordablePrice(income, downPaymentPct, assumptions)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasValidIncome, income, downPaymentPct, mortgageRate, propertyTaxRatePct, insuranceAssumptionPct, pmiAssumptionPct, dtiRatio])

    useEffect(() => {
        onResult?.(result, { income: hasValidIncome ? income : null, downPaymentPct })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result, downPaymentPct])

    const pmiApplies = downPaymentPct < 0.20

    return (
        <div className="tool-card">
            <h2 className="text-base font-semibold text-primary mb-1">
                Home Affordability Estimator — {countyName}
            </h2>
            <p className="text-sm text-muted mb-4">
                Enter your annual household income to estimate the home price that may
                fit within a {(dtiRatio * 100).toFixed(0)}% housing-cost ratio.
                {defaultIncome && (
                    <> We&apos;ve pre-filled an example figure below — enter your own income to personalize the estimate.</>
                )}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="annual-income" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Annual household income
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
                        <input
                            id="annual-income"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1000}
                            placeholder="85,000"
                            value={incomeInput}
                            onChange={(e) => setIncomeInput(e.target.value)}
                            className="w-full pl-6 pr-3 py-2.5 rounded-lg border border-border
                         text-sm font-mono focus:outline-none focus:border-accent/50"
                        />
                    </div>
                </div>

                <div>
                    <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Down payment
                    </span>
                    <div className="flex gap-2">
                        {downPaymentOptionsPct.map((pct) => (
                            <button
                                key={pct}
                                type="button"
                                onClick={() => setDownPaymentPct(pct)}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                          ${downPaymentPct === pct
                                        ? 'border-accent bg-accent/10 text-accent'
                                        : 'border-border text-body hover:border-accent/40'}`}
                            >
                                {(pct * 100).toFixed(0)}%
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-xs text-muted mb-4 space-y-0.5">
                <p>Mortgage rate assumption: {formatPercent(mortgageRate)} — {rateSource}, as of {rateDataAsOf}</p>
                <p>Estimated property tax: based on {countyName}&apos;s {formatPercent(propertyTaxRatePct)} effective rate</p>
                <p>Insurance assumption: {formatPercent(insuranceAssumptionPct)} of home value/year (national assumption)</p>
                {pmiApplies && (
                    <p>PMI assumption: {formatPercent(pmiAssumptionPct)} of loan amount/year (applies below 20% down)</p>
                )}
            </div>

            {result ? (
                <div className="rounded-lg border border-border bg-bg/60 p-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted uppercase tracking-wider mb-1">
                                Estimated affordable home price
                            </p>
                            <p className="text-2xl font-semibold text-primary font-mono">
                                {formatMoney(result.estimatedAffordablePrice)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted uppercase tracking-wider mb-1">
                                Estimated monthly payment
                            </p>
                            <p className="text-2xl font-semibold text-primary font-mono">
                                {formatMoney(result.estimatedMonthlyPayment)}
                            </p>
                        </div>
                    </div>
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border text-xs">
                        <div>
                            <dt className="text-muted">Principal & interest</dt>
                            <dd className="font-mono text-body">{formatMoney(result.breakdown.principalAndInterest)}</dd>
                        </div>
                        <div>
                            <dt className="text-muted">Est. property tax</dt>
                            <dd className="font-mono text-body">{formatMoney(result.breakdown.propertyTax)}</dd>
                        </div>
                        <div>
                            <dt className="text-muted">Insurance</dt>
                            <dd className="font-mono text-body">{formatMoney(result.breakdown.insurance)}</dd>
                        </div>
                        {pmiApplies && (
                            <div>
                                <dt className="text-muted">PMI</dt>
                                <dd className="font-mono text-body">{formatMoney(result.breakdown.pmi)}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            ) : (
                <p className="text-sm text-muted italic">
                    Enter your annual household income above to see your estimate.
                </p>
            )}

            <p className="text-xs text-muted mt-4">
                This is a simplified rule-of-thumb estimate based on gross household
                income only — existing debts (car loans, student loans, credit cards,
                etc.) are not modeled. Not a lender underwriting calculation or a
                pre-approval amount.
            </p>
        </div>
    )
}