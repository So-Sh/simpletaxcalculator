// lib/home-affordability-math.ts
//
// Pure calculation core for the Home Affordability Estimator. Deliberately
// has zero knowledge of Zillow/ZHVI, React, or any data file — it's just
// the algebra from CLAUDE.md's "Core model: income in, price out" section,
// exposed as plain, synchronous, side-effect-free functions so it can be
// unit-tested in complete isolation from the UI and from any data source.
//
// Variable names match the spec exactly:
//   P = home price            D = down payment %        r = mortgage rate
//   T = property-tax rate     I = insurance %            M = PMI % of loan
//   A = annual income         d = DTI / housing-cost ratio (0.28)
//
// PMI is applied only when D < 0.20, per CLAUDE.md ("What not to build":
// never extrapolate PMI beyond the 20%/10% down-payment toggle).

export interface AffordabilityAssumptions {
    /** Annual mortgage interest rate, e.g. 0.0665 for 6.65%. */
    mortgageRate: number
    /** County effective property-tax rate, e.g. 0.0153 for 1.53%. */
    propertyTaxRate: number
    /** National insurance assumption, e.g. 0.0035 for 0.35% of home value/year. */
    insuranceAssumptionPct: number
    /** National PMI assumption, e.g. 0.006 for 0.6% of loan amount/year. Applied only when downPaymentPct < 0.20. */
    pmiAssumptionPct: number
    /** Housing-cost ratio applied to gross income, e.g. 0.28. Applies to gross income only — no debt input. */
    dtiRatio: number
    /** Loan term in years. Defaults to 30 if omitted. */
    termYears?: number
}

export interface MonthlyBreakdown {
    principalAndInterest: number
    propertyTax: number
    insurance: number
    /** 0 when down payment is >= 20% — PMI is never applied above that threshold. */
    pmi: number
    total: number
}

export interface AffordablePriceResult {
    estimatedAffordablePrice: number
    estimatedMonthlyPayment: number
    loanAmount: number
    breakdown: MonthlyBreakdown
}

export interface RequiredIncomeResult {
    requiredAnnualIncome: number
    estimatedMonthlyPayment: number
    loanAmount: number
    breakdown: MonthlyBreakdown
}

const DEFAULT_TERM_YEARS = 30

/**
 * Standard fixed-rate amortization factor: the monthly payment per $1 of
 * loan principal. Handles the 0%-rate edge case (straight-line payoff)
 * since it's cheap to do correctly and costs nothing.
 */
export function mortgageFactor(annualRate: number, termYears: number = DEFAULT_TERM_YEARS): number {
    const n = termYears * 12
    if (annualRate === 0) return 1 / n
    const monthlyRate = annualRate / 12
    return monthlyRate / (1 - Math.pow(1 + monthlyRate, -n))
}

function assertValidInputs(assumptions: AffordabilityAssumptions, downPaymentPct: number) {
    if (downPaymentPct < 0 || downPaymentPct >= 1) {
        throw new Error(`downPaymentPct must be in [0, 1) — got ${downPaymentPct}`)
    }
    if (assumptions.dtiRatio <= 0) {
        throw new Error(`dtiRatio must be > 0 — got ${assumptions.dtiRatio}`)
    }
}

/**
 * Monthly cost coefficient: the fraction of home price P that one month's
 * total housing cost represents, i.e. monthlyCost = P * coefficient.
 * Since tax, insurance, and PMI are all proportional to P (or to the loan
 * amount, itself proportional to P), the whole equation is linear in P —
 * this is what makes both directions solvable algebraically with no
 * iteration. See CLAUDE.md: "solve algebraically... only revisit this if a
 * future assumption introduces genuine non-linearity."
 */
function monthlyCostCoefficient(assumptions: AffordabilityAssumptions, downPaymentPct: number): number {
    const factor = mortgageFactor(assumptions.mortgageRate, assumptions.termYears)
    const loanFraction = 1 - downPaymentPct

    const piCoefficient = loanFraction * factor
    const taxCoefficient = assumptions.propertyTaxRate / 12
    const insuranceCoefficient = assumptions.insuranceAssumptionPct / 12
    const pmiCoefficient =
        downPaymentPct < 0.20 ? (loanFraction * assumptions.pmiAssumptionPct) / 12 : 0

    return piCoefficient + taxCoefficient + insuranceCoefficient + pmiCoefficient
}

function breakdownForPrice(
    price: number,
    assumptions: AffordabilityAssumptions,
    downPaymentPct: number
): MonthlyBreakdown {
    const factor = mortgageFactor(assumptions.mortgageRate, assumptions.termYears)
    const loanAmount = price * (1 - downPaymentPct)

    const principalAndInterest = loanAmount * factor
    const propertyTax = (price * assumptions.propertyTaxRate) / 12
    const insurance = (price * assumptions.insuranceAssumptionPct) / 12
    const pmi = downPaymentPct < 0.20 ? (loanAmount * assumptions.pmiAssumptionPct) / 12 : 0

    return {
        principalAndInterest: round2(principalAndInterest),
        propertyTax: round2(propertyTax),
        insurance: round2(insurance),
        pmi: round2(pmi),
        total: round2(principalAndInterest + propertyTax + insurance + pmi),
    }
}

/**
 * Primary calculation: income -> estimated affordable home price.
 * Solves  A * d / 12 = P * coefficient  for P.
 */
export function solveAffordablePrice(
    annualIncome: number,
    downPaymentPct: number,
    assumptions: AffordabilityAssumptions
): AffordablePriceResult {
    assertValidInputs(assumptions, downPaymentPct)
    if (annualIncome < 0) {
        throw new Error(`annualIncome must be >= 0 — got ${annualIncome}`)
    }

    const monthlyBudget = (annualIncome * assumptions.dtiRatio) / 12
    const coefficient = monthlyCostCoefficient(assumptions, downPaymentPct)
    const price = monthlyBudget / coefficient

    return {
        estimatedAffordablePrice: Math.round(price),
        estimatedMonthlyPayment: round2(monthlyBudget),
        loanAmount: Math.round(price * (1 - downPaymentPct)),
        breakdown: breakdownForPrice(price, assumptions, downPaymentPct),
    }
}

/**
 * Secondary/benchmark calculation: a known home price -> required annual
 * income. Used to answer "what income would a household need for the
 * county's typical (ZHVI) home" — price is already known here, never solved
 * for. See CLAUDE.md: "ZHVI is a benchmark for comparison, never an input
 * to the primary affordability calculation."
 */
export function requiredIncomeForPrice(
    price: number,
    downPaymentPct: number,
    assumptions: AffordabilityAssumptions
): RequiredIncomeResult {
    assertValidInputs(assumptions, downPaymentPct)
    if (price < 0) {
        throw new Error(`price must be >= 0 — got ${price}`)
    }

    const breakdown = breakdownForPrice(price, assumptions, downPaymentPct)
    const requiredAnnualIncome = (breakdown.total * 12) / assumptions.dtiRatio

    return {
        requiredAnnualIncome: Math.round(requiredAnnualIncome),
        estimatedMonthlyPayment: breakdown.total,
        loanAmount: Math.round(price * (1 - downPaymentPct)),
        breakdown,
    }
}

function round2(n: number): number {
    return Math.round(n * 100) / 100
}