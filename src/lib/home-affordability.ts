// lib/home-affordability.ts
//
// Data access for the Home Affordability Estimator. Mirrors the shape of
// lib/property-tax.ts (getAllPropertyTaxStates / getPropertyTaxMeta /
// getStatesSortedByRateRange) so the two pillar pages stay consistent.
//
// ZHVI is read in full here (all-states pattern, same as property-tax.json)
// — that's fine for a pillar-level comparison table. It is NOT the file
// route generation should read for "which counties get a page"; that's
// meta/home-affordability-counties-index.json (see build_home_values_json.py).

import homeValues from '@/data/home-values.json'
import mortgageAssumptions from '@/data/mortgage-assumptions.json'
import statesIndex from '@/data/meta/states-index.json'
import countyIndex from '@/data/meta/home-affordability-counties-index.json'
// ASSUMPTION: I don't have your actual property-tax.json / lib/property-tax.ts
// source, so this shape is inferred from CLAUDE.md's documented all-states
// pattern (states[].counties[] with per-county numeric fields, keyed by
// FIPS). Adjust the field name below (medianEffectiveRate) and the import
// path if your real file differs.
import propertyTax from '@/data/rates/property-tax-2024.json'

export interface HomeAffordabilityCounty {
    fips: string
    sizeRank: number
    name: string
    stateSlug: string
    latestValue: number | null
    oneYearAgoValue: number | null
    oneYearChangePct: number | null
    fiveYearAgoValue: number | null
    fiveYearChangePct: number | null
}

export interface HomeAffordabilityMeta {
    dataAsOf: string
    lastUpdated: string
    officialSourceUrl: string
    officialSourceLabel: string
}

export interface MortgageAssumptions {
    rate: number
    rateSource: string
    rateSourceUrl: string
    dataAsOf: string
    lastUpdated: string
    insuranceAssumptionPct: number
    insuranceAssumptionLabel: string
    pmiAssumptionPct: number
    pmiAssumptionLabel: string
    downPaymentOptionsPct: number[]
    dtiRatio: number
}

export interface StateSummary {
    slug: string
    name: string
    abbreviation: string
}

export interface HomeValueRange {
    lowest: HomeAffordabilityCounty | null
    highest: HomeAffordabilityCounty | null
}

const ALL_COUNTIES = homeValues.counties as HomeAffordabilityCounty[]

let cachedNationalMedian: number | null | undefined // undefined = not yet computed

/**
 * Median ZHVI value across every county with data. Computed once and
 * cached — used to bucket a county as high/mid/low cost relative to the
 * nation, for FAQ content that genuinely varies rather than being
 * boilerplate with swapped numbers. Derived entirely from home-values.json,
 * already loaded — this is not a new data source.
 */
export function getNationalMedianHomeValue(): number | null {
    if (cachedNationalMedian !== undefined) return cachedNationalMedian

    const values = ALL_COUNTIES
        .map((c) => c.latestValue)
        .filter((v): v is number => v !== null)
        .sort((a, b) => a - b)

    if (values.length === 0) {
        cachedNationalMedian = null
        return null
    }

    const mid = Math.floor(values.length / 2)
    cachedNationalMedian = values.length % 2 === 0
        ? (values[mid - 1] + values[mid]) / 2
        : values[mid]

    return cachedNationalMedian
}

export interface CountyIndexEntry {
    fips: string
    sizeRank: number
    slug: string
    name: string
    stateSlug: string
}

interface PropertyTaxCounty {
    fips: string
    name: string
    medianEffectiveRate: number | null
}

interface PropertyTaxStateEntry {
    slug: string
    counties: PropertyTaxCounty[]
}

export interface CountyAffordabilityData {
    fips: string
    countyName: string
    countySlug: string
    stateSlug: string
    stateName: string
    stateAbbreviation: string
    zhvi: {
        latestValue: number | null
        dataAsOf: string
        oneYearChangePct: number | null
        fiveYearChangePct: number | null
    }
    /** Null when the county has no property-tax coverage — render "Data not available", never 0. */
    propertyTaxRatePct: number | null
}

const COUNTY_INDEX = countyIndex as CountyIndexEntry[]

export function getStateMeta(stateSlug: string): StateSummary | undefined {
    return (statesIndex as StateSummary[]).find((s) => s.slug === stateSlug)
}

export interface StateCountyListEntry {
    slug: string
    name: string
    fips: string
    sizeRank: number
    latestValue: number | null
    oneYearChangePct: number | null
}

/**
 * Counties currently published for this state — i.e. present in the
 * rollout-batch index, not every county Zillow has data for. This is what
 * the state pillar's county grid/table should read, so it never links to
 * a county page that doesn't exist yet.
 */
export function getPublishedCountiesForState(stateSlug: string): StateCountyListEntry[] {
    const zhviByFips = new Map(ALL_COUNTIES.map((c) => [c.fips, c]))

    return COUNTY_INDEX.filter((c) => c.stateSlug === stateSlug)
        .map((entry) => {
            const zhvi = zhviByFips.get(entry.fips)
            return {
                slug: entry.slug,
                name: entry.name,
                fips: entry.fips,
                sizeRank: entry.sizeRank,
                latestValue: zhvi?.latestValue ?? null,
                oneYearChangePct: zhvi?.oneYearChangePct ?? null,
            }
        })
        .sort((a, b) => a.sizeRank - b.sizeRank)
}

function getPropertyTaxRate(stateSlug: string, fips: string): number | null {
    const stateEntry = (propertyTax as { states: PropertyTaxStateEntry[] }).states.find(
        (s) => s.slug === stateSlug
    )
    const county = stateEntry?.counties.find((c) => c.fips === fips)
    return county?.medianEffectiveRate ?? null
}

/**
 * Route params for the currently selected rollout batch — reads the same
 * batch-limited index build_home_values_json.py's --limit/--offset control.
 * Regenerating that index (a new batch) is what expands this list; nothing
 * here decides which counties are "eligible" beyond what's already in the
 * index (see build_home_values_json.py's build_county_index docstring).
 */
export function getHomeAffordabilityRouteParams(): Array<{ state: string; county: string }> {
    return COUNTY_INDEX.map((c) => ({ state: c.stateSlug, county: c.slug }))
}

/** Combined ZHVI + property-tax data for one county page, joined by FIPS. */
export function getCountyAffordabilityData(
    stateSlug: string,
    countySlug: string
): CountyAffordabilityData | null {
    const indexEntry = COUNTY_INDEX.find((c) => c.stateSlug === stateSlug && c.slug === countySlug)
    if (!indexEntry) return null

    const stateMeta = getStateMeta(stateSlug)
    if (!stateMeta) return null

    const zhviRecord = ALL_COUNTIES.find((c) => c.fips === indexEntry.fips)

    return {
        fips: indexEntry.fips,
        countyName: indexEntry.name,
        countySlug: indexEntry.slug,
        stateSlug,
        stateName: stateMeta.name,
        stateAbbreviation: stateMeta.abbreviation,
        zhvi: {
            latestValue: zhviRecord?.latestValue ?? null,
            dataAsOf: homeValues.dataAsOf,
            oneYearChangePct: zhviRecord?.oneYearChangePct ?? null,
            fiveYearChangePct: zhviRecord?.fiveYearChangePct ?? null,
        },
        propertyTaxRatePct: getPropertyTaxRate(stateSlug, indexEntry.fips),
    }
}



/** States with a live home-affordability section, for the pillar's state grid. */
export function getAllHomeAffordabilityStates(): StateSummary[] {
    return (statesIndex as Array<StateSummary & { availableTaxTypes: string[] }>)
        .filter((s) => s.availableTaxTypes.includes('home-affordability'))
        .map(({ slug, name, abbreviation }) => ({ slug, name, abbreviation }))
}

/** ZHVI benchmark-dataset metadata — vintage and attribution for the pillar disclaimer. */
export function getHomeAffordabilityMeta(): HomeAffordabilityMeta {
    return {
        dataAsOf: homeValues.dataAsOf,
        lastUpdated: homeValues.lastUpdated,
        officialSourceUrl: homeValues.officialSourceUrl,
        officialSourceLabel: homeValues.officialSourceLabel,
    }
}

/** Global mortgage-rate / insurance / PMI / DTI assumptions (not per-county). */
export function getMortgageAssumptions(): MortgageAssumptions {
    return mortgageAssumptions as MortgageAssumptions
}

/** All counties with ZHVI data for one state, by slug. */
export function getCountiesForState(stateSlug: string): HomeAffordabilityCounty[] {
    return ALL_COUNTIES.filter((c) => c.stateSlug === stateSlug)
}

/**
 * Lowest/highest typical-home-value county per state, for the pillar's
 * comparison table — same idea as property tax's lowest/highest effective
 * rate per state. Counties with a null latestValue (no Zillow coverage)
 * are excluded from the range, not treated as $0.
 */
export function getStatesSortedByHomeValueRange(
    direction: 'asc' | 'desc' = 'desc'
): Array<{ state: StateSummary; range: HomeValueRange }> {
    const states = getAllHomeAffordabilityStates()

    const withRanges = states.map((state) => {
        const counties = getCountiesForState(state.slug).filter(
            (c): c is HomeAffordabilityCounty & { latestValue: number } =>
                c.latestValue !== null
        )

        if (counties.length === 0) {
            return { state, range: { lowest: null, highest: null } as HomeValueRange }
        }

        const lowest = counties.reduce((a, b) => (a.latestValue < b.latestValue ? a : b))
        const highest = counties.reduce((a, b) => (a.latestValue > b.latestValue ? a : b))

        return { state, range: { lowest, highest } }
    })

    return withRanges.sort((a, b) => {
        const av = a.range.highest?.latestValue ?? (direction === 'desc' ? -Infinity : Infinity)
        const bv = b.range.highest?.latestValue ?? (direction === 'desc' ? -Infinity : Infinity)
        return direction === 'desc' ? bv - av : av - bv
    })
}