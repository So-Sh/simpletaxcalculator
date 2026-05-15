export interface StateMeta {
    slug: string
    name: string
    abbreviation: string
    availableTaxTypes: string[]
}

export interface TaxTypeData {
    // injected by lib/rates.ts — not stored in JSON
    stateName: string
    stateSlug: string
    taxType: string
    // stored in JSON
    customIntro: string
    officialSourceUrl: string   // official state DoR page — required, never empty
    officialSourceLabel: string // e.g. "Ohio Department of Taxation"
    rates: {
        state: number
        average_combined: number
    }
    counties: { name: string; rate: number }[]
    lastUpdated: string
    formula: string
    example: { price: number; tax: number; total: number }
    scenarios: { label: string; price: number; tax: number }[]
    taxFreeWeekends: { name: string; dates: string; items: string }[]
    faqs: { question: string; answer: string }[]
    relatedTools: { label: string; href: string }[]
}

export interface StateFile {
    slug: string
    name: string
    abbreviation: string
    taxTypes: Record<string, Omit<TaxTypeData, 'stateName' | 'stateSlug' | 'taxType'>>
}