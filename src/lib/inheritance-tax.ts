// lib/inheritance-tax.ts

import data from '@/data/rates/inheritance-tax.json'

export interface BracketTier {
  upTo: number | null // null = no upper bound (top bracket)
  rate: number
}

export interface BeneficiaryClass {
  class: string
  rate: number | null // null when the class uses brackets instead of a flat rate
  description: string
  exemptionAmount: number | null
  brackets?: BracketTier[]
  rateRange?: { min: number; max: number } // shown for classes we describe as a range (KY) rather than full bracket detail
}

export interface EarlyPaymentDiscount {
  rate: number
  deadlineMonths: number
  description: string
  secondTierRate?: number
  secondTierDeadlineMonths?: number
}

export interface StateInheritanceTaxData {
  slug: string
  name: string
  abbreviation: string
  hasInheritanceTax: boolean
  customIntro: string
  exemptionThreshold: number | null
  exemptionNote: string
  isCountyCollected?: boolean
  beneficiaryClasses: BeneficiaryClass[]
  additionalExemptions?: string
  earlyPaymentDiscount: EarlyPaymentDiscount | null
  filingDeadlineMonths: number
  hasStateEstateTax: boolean
  stateEstateTaxNote?: string
  faqs: { question: string; answer: string }[]
  relatedTools: { label: string; href: string }[]
  officialSourceUrl: string
  officialSourceLabel: string
}

export interface FederalEstateTaxData {
  exemptionPerIndividual: number
  exemptionPerMarriedCouple: number
  topRate: number
  note: string
  sourceUrl: string
  sourceLabel: string
}

interface InheritanceTaxData {
  lastUpdated: string
  dataAsOf: string
  officialSourceLabel: string
  notes: {
    scope: string
    beneficiaryClasses: string
    federalEstateTax: string
    watchItems: string
  }
  federalEstateTax: FederalEstateTaxData
  states: StateInheritanceTaxData[]
}

const inheritanceTaxData = data as InheritanceTaxData

export function getAllInheritanceTaxStates(): StateInheritanceTaxData[] {
  return inheritanceTaxData.states
}

export function getStateInheritanceTax(slug: string): StateInheritanceTaxData | null {
  return inheritanceTaxData.states.find((s) => s.slug === slug) ?? null
}

export function getInheritanceTaxMeta() {
  return {
    lastUpdated: inheritanceTaxData.lastUpdated,
    dataAsOf: inheritanceTaxData.dataAsOf,
    officialSourceLabel: inheritanceTaxData.officialSourceLabel,
    notes: inheritanceTaxData.notes,
  }
}

export function getFederalEstateTax(): FederalEstateTaxData {
  return inheritanceTaxData.federalEstateTax
}

// Computes the inheritance tax owed for a given beneficiary class and inherited amount.
// Handles three shapes present in the data: flat rate (rate is a number, no brackets),
// flat rate with a simple exemption (rate applies above exemptionAmount), and graduated
// brackets (NJ Class C/D) where each tier's rate applies only to the slice of value within it.
export function calculateInheritanceTax(
  beneficiaryClass: BeneficiaryClass,
  inheritedAmount: number
): number {
  if (inheritedAmount <= 0) return 0

  const exemption = beneficiaryClass.exemptionAmount ?? 0
  const taxableAmount = Math.max(0, inheritedAmount - exemption)

  if (taxableAmount === 0) return 0

  // Graduated bracket case (e.g. NJ Class C, Class D)
  if (beneficiaryClass.brackets && beneficiaryClass.brackets.length > 0) {
    let tax = 0
    let previousCeiling = 0

    for (const tier of beneficiaryClass.brackets) {
      const tierCeiling = tier.upTo ?? Infinity
      const sliceTop = Math.min(taxableAmount, tierCeiling)
      const sliceAmount = Math.max(0, sliceTop - previousCeiling)

      tax += sliceAmount * tier.rate
      previousCeiling = tierCeiling

      if (taxableAmount <= tierCeiling) break
    }

    return tax
  }

  // Flat rate case (PA, MD, NE, and KY when treated as a single representative rate)
  if (beneficiaryClass.rate !== null) {
    return taxableAmount * beneficiaryClass.rate
  }

  // KY Class B/C only provide a rateRange in this dataset (a true graduated schedule
  // wasn't captured per-tier) — fall back to the midpoint as a clearly-labeled estimate.
  // Callers should prefer showing the range to the user rather than relying solely on
  // this single number; see PropertyTax-style "estimate" framing in CLAUDE.md.
  if (beneficiaryClass.rateRange) {
    const midRate = (beneficiaryClass.rateRange.min + beneficiaryClass.rateRange.max) / 2
    return taxableAmount * midRate
  }

  return 0
}

// Computes federal estate tax owed, given a total estate value and filing status.
// Per CLAUDE.md's Calculator vs Estimator rule, this is presented as an estimate in the
// UI even though the math is exact, because most callers won't know their exact taxable
// estate value (after deductions) — the formula itself is precise once given a clean input.
export function calculateFederalEstateTax(
  estateValue: number,
  isMarried: boolean
): { taxableAmount: number; tax: number; exemption: number } {
  const federal = getFederalEstateTax()
  const exemption = isMarried ? federal.exemptionPerMarriedCouple : federal.exemptionPerIndividual
  const taxableAmount = Math.max(0, estateValue - exemption)
  const tax = taxableAmount * federal.topRate

  return { taxableAmount, tax, exemption }
}