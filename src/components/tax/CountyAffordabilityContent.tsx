'use client'

// components/tax/CountyAffordabilityContent.tsx
//
// Page-level composition for one county's affordability page. This is the
// component that's allowed to know about Zillow — HomeAffordabilityCalculator
// itself stays ignorant of it. Renders the calculator once for user income,
// then reuses the pure math module directly (not the calculator component)
// for the reverse ZHVI-benchmark calculation, per CLAUDE.md's architecture:
//
//   HomeAffordabilityCalculator (pure math, no Zillow knowledge)
//           |
//   CountyAffordabilityContent (combines calculator result + ZHVI + tax rate)
//
// Down payment selection is lifted here so the user's estimate and the
// benchmark comparison always use the same down-payment assumption —
// otherwise "$X vs. the typical home's $Y" would silently compare two
// different scenarios.

import Link from 'next/link'
import { useMemo, useState } from 'react'
import HomeAffordabilityCalculator from './HomeAffordabilityCalculator'
import {
    requiredIncomeForPrice,
    type AffordabilityAssumptions,
    type AffordablePriceResult,
} from '@/lib/home-affordability-math'
import type { CountyAffordabilityData, MortgageAssumptions } from '@/lib/home-affordability'

interface CountyAffordabilityContentProps {
    county: CountyAffordabilityData
    assumptions: MortgageAssumptions
}

function formatMoney(n: number) {
    return '$' + Math.round(n).toLocaleString()
}

function formatPercent(n: number) {
    return (n * 100).toFixed(2) + '%'
}

function formatSignedPercent(n: number) {
    const pct = (n * 100).toFixed(1)
    return (n >= 0 ? '+' : '') + pct + '%'
}

export default function CountyAffordabilityContent({ county, assumptions }: CountyAffordabilityContentProps) {
    const [downPaymentPct, setDownPaymentPct] = useState(assumptions.downPaymentOptionsPct[0])
    const [userResult, setUserResult] = useState<AffordablePriceResult | null>(null)
    const [userIncome, setUserIncome] = useState<number | null>(null)

    // Property tax rate for this county may be null (no Census coverage).
    // Falling back to 0 would understate the estimate silently, so instead
    // the math simply isn't run until a real rate exists.
    const hasPropertyTaxRate = county.propertyTaxRatePct !== null

    const mathAssumptions: AffordabilityAssumptions | null = hasPropertyTaxRate
        ? {
            mortgageRate: assumptions.rate,
            propertyTaxRate: county.propertyTaxRatePct as number,
            insuranceAssumptionPct: assumptions.insuranceAssumptionPct,
            pmiAssumptionPct: assumptions.pmiAssumptionPct,
            dtiRatio: assumptions.dtiRatio,
        }
        : null

    const benchmark = useMemo(() => {
        if (!mathAssumptions || county.zhvi.latestValue === null) return null
        return requiredIncomeForPrice(county.zhvi.latestValue, downPaymentPct, mathAssumptions)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mathAssumptions, county.zhvi.latestValue, downPaymentPct])

    const comparison = useMemo(() => {
        if (!userResult || county.zhvi.latestValue === null) return null
        const diff = userResult.estimatedAffordablePrice - county.zhvi.latestValue
        const pctOfTypical = userResult.estimatedAffordablePrice / county.zhvi.latestValue
        return { diff, pct: diff / county.zhvi.latestValue, pctOfTypical }
    }, [userResult, county.zhvi.latestValue])

    // Rounded to the nearest $1,000 so it reads as a normal income figure
    // rather than a suspiciously precise derived number (e.g. $232,000, not
    // $231,810). This also gives the page real, county-specific numbers on
    // initial (server) render instead of an empty input.
    const defaultIncome = benchmark ? Math.round(benchmark.requiredAnnualIncome / 1000) * 1000 : undefined

    if (!hasPropertyTaxRate) {
        return (
            <div className="tool-card">
                <p className="text-sm text-muted">
                    Home affordability data isn&apos;t available for {county.countyName} yet —
                    we don&apos;t have a property tax rate on file for this county.
                </p>
            </div>
        )
    }

    return (
        <>
            <HomeAffordabilityCalculator
                countyName={county.countyName}
                propertyTaxRatePct={county.propertyTaxRatePct as number}
                mortgageRate={assumptions.rate}
                rateSource={assumptions.rateSource}
                rateDataAsOf={assumptions.dataAsOf}
                insuranceAssumptionPct={assumptions.insuranceAssumptionPct}
                pmiAssumptionPct={assumptions.pmiAssumptionPct}
                downPaymentOptionsPct={assumptions.downPaymentOptionsPct}
                dtiRatio={assumptions.dtiRatio}
                downPaymentPct={downPaymentPct}
                onDownPaymentPctChange={setDownPaymentPct}
                defaultIncome={defaultIncome}
                onResult={(result, context) => {
                    setUserResult(result)
                    setUserIncome(context.income)
                }}
            />

            {/* Benchmark — never framed as an affordability threshold, per CLAUDE.md wording rules */}
            <div className="tool-card">
                <h2 className="text-base font-semibold text-primary mb-1">
                    Compared with {county.countyName}&apos;s typical home value
                </h2>
                {county.zhvi.latestValue !== null ? (
                    <>
                        <p className="text-sm text-body">
                            Typical home value (Zillow ZHVI, {county.zhvi.dataAsOf}):{' '}
                            <span className="font-mono font-semibold">{formatMoney(county.zhvi.latestValue)}</span>
                        </p>
                        <div className="flex gap-4 mt-1 text-xs text-muted">
                            {county.zhvi.oneYearChangePct !== null && (
                                <span>1-year change: {formatSignedPercent(county.zhvi.oneYearChangePct)}</span>
                            )}
                            {county.zhvi.fiveYearChangePct !== null && (
                                <span>5-year change: {formatSignedPercent(county.zhvi.fiveYearChangePct)}</span>
                            )}
                        </div>
                        {comparison && (
                            <p className="text-sm text-body mt-3">
                                Your estimated affordable home price is{' '}
                                <span className="font-semibold">{formatMoney(Math.abs(comparison.diff))}</span>{' '}
                                {comparison.diff >= 0 ? 'above' : 'below'}{' '}the county&apos;s typical home value.
                            </p>
                        )}
                        {comparison && userIncome !== null && (
                            <p className="text-sm text-body mt-1">
                                A household earning {formatMoney(userIncome)} can afford roughly{' '}
                                <span className="font-semibold">{(comparison.pctOfTypical * 100).toFixed(0)}%</span>{' '}
                                of a typical home in {county.countyName}.
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-muted">Data not available for this county.</p>
                )}
            </div>

            {/* Income needed for the typical home — the reverse calculation */}
            {benchmark && county.zhvi.latestValue !== null && (
                <div className="tool-card">
                    <h2 className="text-base font-semibold text-primary mb-1">
                        What income is needed for a typical {county.countyName} home?
                    </h2>
                    <p className="text-sm text-body">
                        Based on the same assumptions, a household would need approximately{' '}
                        <span className="font-mono font-semibold">{formatMoney(benchmark.requiredAnnualIncome)}</span>{' '}
                        in annual income to support the typical {formatMoney(county.zhvi.latestValue)} home at a{' '}
                        {(assumptions.dtiRatio * 100).toFixed(0)}% housing-cost ratio.
                    </p>
                </div>
            )}

            {/* Property tax cross-link — see CLAUDE.md: link to the per-county URL once it exists */}
            <div className="tool-card">
                <h2 className="text-base font-semibold text-primary mb-1">
                    {county.countyName} property taxes
                </h2>
                <p className="text-sm text-body">
                    Estimated property tax: based on {county.countyName}&apos;s{' '}
                    <span className="font-mono font-semibold">{formatPercent(county.propertyTaxRatePct as number)}</span>{' '}
                    effective rate.
                </p>
                {/* TODO: swap to `/${county.stateSlug}/${county.countySlug}/property-tax` once
                    standalone per-county property-tax URLs exist — today property tax only
                    exposes county data via the in-page dropdown on the state page. */}
                <Link prefetch={false} href={`/${county.stateSlug}/property-tax`}
                    className="text-sm text-accent hover:underline underline-offset-2">
                    See the full {county.stateName} Property Tax Estimator →
                </Link>
            </div>
        </>
    )
}