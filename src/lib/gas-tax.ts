import data from '@/data/rates/gas-tax.json'

export interface FuelRates {
    exciseRateCents: number
    exciseRate: number
    combinedRateCents: number
    combinedRate: number
}

export interface StateGasTaxData {
    slug: string
    name: string
    abbreviation: string
    gasoline: FuelRates
    diesel: FuelRates
    note: string
    officialSourceUrl: string
    officialSourceLabel: string
}

export interface FederalFuelRates {
    exciseRateCents: number
    exciseRate: number
    combinedRateCents: number
    combinedRate: number
    note: string
    lust: number
    lustNote: string
}

interface GasTaxData {
    lastUpdated: string
    dataAsOf: string
    officialSourceUrl: string
    officialSourceLabel: string
    secondarySourceUrl: string
    secondarySourceLabel: string
    tertiarySourceUrl: string
    tertiarySourceLabel: string
    notes: {
        exciseRate: string
        combinedRate: string
        federalNotIncluded: string
    }
    federal: {
        gasoline: FederalFuelRates
        diesel: FederalFuelRates
    }
    states: StateGasTaxData[]
    corrections: {
        state: string
        field: string
        originalValue: number
        correctedValue: number
        reason: string
    }[]
    faqs: { question: string; answer: string }[]
}

const gasTaxData = data as GasTaxData

export function getAllGasTaxStates(): StateGasTaxData[] {
    return gasTaxData.states
}

export function getStateGasTax(slug: string): StateGasTaxData | null {
    return gasTaxData.states.find((s) => s.slug === slug) ?? null
}

export function getGasTaxMeta() {
    return {
        lastUpdated: gasTaxData.lastUpdated,
        dataAsOf: gasTaxData.dataAsOf,
        officialSourceUrl: gasTaxData.officialSourceUrl,
        officialSourceLabel: gasTaxData.officialSourceLabel,
        notes: gasTaxData.notes,
        federal: gasTaxData.federal,
        faqs: gasTaxData.faqs,
    }
}

export function getStatesSortedByCombinedRate(
    fuel: 'gasoline' | 'diesel' = 'gasoline',
    order: 'asc' | 'desc' = 'desc'
): StateGasTaxData[] {
    return [...gasTaxData.states].sort((a, b) => {
        const diff = a[fuel].combinedRateCents - b[fuel].combinedRateCents
        return order === 'desc' ? -diff : diff
    })
}

export function getStatesSortedByExciseRate(
    fuel: 'gasoline' | 'diesel' = 'gasoline',
    order: 'asc' | 'desc' = 'desc'
): StateGasTaxData[] {
    return [...gasTaxData.states].sort((a, b) => {
        const diff = a[fuel].exciseRateCents - b[fuel].exciseRateCents
        return order === 'desc' ? -diff : diff
    })
}