// lib/property-tax.ts

import data from '@/data/rates/property-tax-2024.json'

export interface CountyPropertyTax {
    fips: string
    name: string
    medianTaxPaid: number | null
    isFloorValue: boolean
    medianEffectiveRate: number | null
    pctChangeInflationAdjusted: number | null
}

export interface StatePropertyTaxData {
    slug: string
    name: string
    abbreviation: string
    customIntro: string
    formula: string
    faqs: { question: string; answer: string }[]
    relatedTools: { label: string; href: string }[]
    countyCount: number
    counties: CountyPropertyTax[]
}

interface PropertyTaxData {
    lastUpdated: string
    dataAsOf: string
    officialSourceUrl: string
    officialSourceLabel: string
    secondarySourceUrl: string
    secondarySourceLabel: string
    notes: {
        medianEffectiveRate: string
        medianTaxPaid: string
        isFloorValue: string
        pctChangeInflationAdjusted: string
        nullValues: string
        districtOfColumbia: string
    }
    states: StatePropertyTaxData[]
}

const propertyTaxData = data as PropertyTaxData

export function getAllPropertyTaxStates(): StatePropertyTaxData[] {
    return propertyTaxData.states
}

export function getStatePropertyTax(slug: string): StatePropertyTaxData | null {
    return propertyTaxData.states.find((s) => s.slug === slug) ?? null
}

export function getPropertyTaxMeta() {
    return {
        lastUpdated: propertyTaxData.lastUpdated,
        dataAsOf: propertyTaxData.dataAsOf,
        officialSourceUrl: propertyTaxData.officialSourceUrl,
        officialSourceLabel: propertyTaxData.officialSourceLabel,
        secondarySourceUrl: propertyTaxData.secondarySourceUrl,
        secondarySourceLabel: propertyTaxData.secondarySourceLabel,
        notes: propertyTaxData.notes,
    }
}

// Returns the range of county-level median effective rates for a state
// (lowest and highest county, excluding nulls). We deliberately do NOT
// compute a single state-level rate (e.g. median-of-medians or a simple
// average) — that would be a derived statistic of a derived statistic,
// which is statistically awkward and behaves oddly for states with few
// counties (e.g. Delaware's 3). A range is honest about the fact that
// property tax varies locally and doesn't require picking an aggregation
// method we'd have to defend on a YMYL page.
export interface CountyRateRange {
    lowest: { name: string; medianEffectiveRate: number } | null
    highest: { name: string; medianEffectiveRate: number } | null
}

export function getStateRateRange(state: StatePropertyTaxData): CountyRateRange {
    const withRates = state.counties.filter(
        (c): c is CountyPropertyTax & { medianEffectiveRate: number } => c.medianEffectiveRate !== null
    )

    if (withRates.length === 0) return { lowest: null, highest: null }

    const sorted = [...withRates].sort((a, b) => a.medianEffectiveRate - b.medianEffectiveRate)
    const lowest = sorted[0]
    const highest = sorted[sorted.length - 1]

    return {
        lowest: { name: lowest.name, medianEffectiveRate: lowest.medianEffectiveRate },
        highest: { name: highest.name, medianEffectiveRate: highest.medianEffectiveRate },
    }
}

// Sorts states for the pillar page comparison table, using each state's
// highest county rate as the sort key (a state with one very high-tax
// county is meaningfully "high property tax" even if its other counties
// are low — this surfaces that rather than averaging it away).
export function getStatesSortedByRateRange(
    order: 'asc' | 'desc' = 'desc'
): { state: StatePropertyTaxData; range: CountyRateRange }[] {
    return [...propertyTaxData.states]
        .map((state) => ({ state, range: getStateRateRange(state) }))
        .filter((s) => s.range.highest !== null)
        .sort((a, b) => {
            const diff =
                (a.range.highest as { medianEffectiveRate: number }).medianEffectiveRate -
                (b.range.highest as { medianEffectiveRate: number }).medianEffectiveRate
            return order === 'desc' ? -diff : diff
        })
}

// Sort counties within a state — used by the state page county table.
export function getCountiesSortedByRate(
    state: StatePropertyTaxData,
    order: 'asc' | 'desc' = 'desc'
): CountyPropertyTax[] {
    return [...state.counties]
        .filter((c) => c.medianEffectiveRate !== null)
        .sort((a, b) => {
            const diff = (a.medianEffectiveRate as number) - (b.medianEffectiveRate as number)
            return order === 'desc' ? -diff : diff
        })
}