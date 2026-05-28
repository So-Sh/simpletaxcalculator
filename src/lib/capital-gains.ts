import data from '@/data/rates/capital-gains.json'

export interface StateCapitalGainsData {
  slug: string
  name: string
  treatment: 'no_tax' | 'flat' | 'ordinary_income' | 'preferential' | 'special'
  topRate: number
  topRateWithSurcharge?: number
  topRateWithCityTax?: number
  preferentialRate?: number
  note: string
}

interface CapitalGainsData {
  lastUpdated: string
  officialSourceUrl: string
  officialSourceLabel: string
  federal: {
    longTerm: {
      note: string
      rates: {
        rate: number
        brackets: Record<string, { min: number; max: number | null }>
      }[]
    }
    shortTerm: { note: string; rates: number[] }
    niit: {
      rate: number
      note: string
      thresholds: Record<string, number>
    }
    standardDeduction2026: Record<string, number>
  }
  states: StateCapitalGainsData[]
  faqs: { question: string; answer: string }[]
}

const capitalGainsData = data as CapitalGainsData

export function getAllCapitalGainsStates(): StateCapitalGainsData[] {
  return capitalGainsData.states
}

export function getStateCapitalGains(slug: string): StateCapitalGainsData | null {
  return capitalGainsData.states.find((s) => s.slug === slug) ?? null
}

export function getCapitalGainsMeta() {
  return {
    lastUpdated: capitalGainsData.lastUpdated,
    officialSourceUrl: capitalGainsData.officialSourceUrl,
    officialSourceLabel: capitalGainsData.officialSourceLabel,
    federal: capitalGainsData.federal,
    faqs: capitalGainsData.faqs,
  }
}

export function getTreatmentLabel(treatment: StateCapitalGainsData['treatment']): string {
  switch (treatment) {
    case 'no_tax':         return 'No state tax'
    case 'flat':           return 'Flat rate'
    case 'ordinary_income': return 'Taxed as ordinary income'
    case 'preferential':   return 'Preferential rate'
    case 'special':        return 'Special rules'
    default:               return 'See details'
  }
}