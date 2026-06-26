// components/tax/InheritanceTaxCalculator.tsx

'use client'

import { useState } from 'react'
import LastUpdatedBadge from './LastUpdatedBadge'
import type { StateInheritanceTaxData, FederalEstateTaxData, BeneficiaryClass } from '@/lib/inheritance-tax'
import { calculateInheritanceTax, calculateFederalEstateTax } from '@/lib/inheritance-tax'

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatPercent(n: number) {
  return (n * 100).toFixed(1).replace(/\.0$/, '') + '%'
}

function formatClassRate(beneficiaryClass: BeneficiaryClass): string {
  if (beneficiaryClass.brackets) {
    const rates = beneficiaryClass.brackets.map((b) => formatPercent(b.rate))
    return rates.join('–')
  }
  if (beneficiaryClass.rateRange) {
    return `${formatPercent(beneficiaryClass.rateRange.min)}–${formatPercent(beneficiaryClass.rateRange.max)}`
  }
  if (beneficiaryClass.rate !== null) {
    return formatPercent(beneficiaryClass.rate)
  }
  return 'N/A'
}

interface InheritanceTaxCalculatorProps {
  stateData: StateInheritanceTaxData | null // null = no state pre-selected (pillar page)
  federal: FederalEstateTaxData
  lastUpdated: string
}

export default function InheritanceTaxCalculator({
  stateData,
  federal,
  lastUpdated,
}: InheritanceTaxCalculatorProps) {
  const [mode, setMode] = useState<'state' | 'federal'>(stateData ? 'state' : 'federal')
  const [inheritedAmount, setInheritedAmount] = useState<number>(100000)
  const [selectedClassIndex, setSelectedClassIndex] = useState(0)
  const [estateValue, setEstateValue] = useState<number>(2000000)
  const [isMarried, setIsMarried] = useState(false)

  const selectedClass = stateData?.beneficiaryClasses[selectedClassIndex] ?? null
  const stateTax = selectedClass ? calculateInheritanceTax(selectedClass, inheritedAmount) : null
  const federalResult = calculateFederalEstateTax(estateValue, isMarried)

  return (
    <div className="tool-card">

      {/* Mode toggle — only shown when a state is selected; pillar page is federal-only */}
      {stateData && (
        <div className="mb-5">
          <div className="flex gap-3">
            <button
              onClick={() => setMode('state')}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                ${mode === 'state'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-muted border-border hover:border-primary/40'
                }`}
            >
              {stateData.name} inheritance tax
            </button>
            <button
              onClick={() => setMode('federal')}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                ${mode === 'federal'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-muted border-border hover:border-primary/40'
                }`}
            >
              Federal estate tax
            </button>
          </div>
        </div>
      )}

      {mode === 'state' && stateData && (
        <>
          {/* Beneficiary class selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Your relationship to the deceased
            </label>
            <select
              value={selectedClassIndex}
              onChange={(e) => setSelectedClassIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-body
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              {stateData.beneficiaryClasses.map((bc, i) => (
                <option key={i} value={i}>
                  {bc.class} — {formatClassRate(bc)}
                </option>
              ))}
            </select>
          </div>

          {/* Inherited amount */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Amount you inherited
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">$</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={inheritedAmount}
                onChange={(e) => setInheritedAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-surface pl-6 pr-3 py-2.5 text-sm text-body
                           focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Rate summary */}
          {selectedClass && (
            <div className="rounded-lg bg-bg border border-border px-4 py-3 mb-4 text-xs text-muted space-y-1">
              <div className="flex justify-between">
                <span>Exemption</span>
                <span className="font-mono text-body">
                  {selectedClass.exemptionAmount ? formatCurrency(selectedClass.exemptionAmount) : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax rate</span>
                <span className="font-mono text-body">{formatClassRate(selectedClass)}</span>
              </div>
            </div>
          )}

          <div className="mb-4">
            <LastUpdatedBadge lastUpdated={lastUpdated} />
          </div>

          {/* Results */}
          {stateTax !== null && (
            <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-4">
              <p className="text-xs text-muted mb-3">
                {stateData.name} inheritance tax on{' '}
                <strong className="text-body">{formatCurrency(inheritedAmount)}</strong>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted mb-1">Tax owed</p>
                  <p className="text-base font-semibold text-accent">{formatCurrency(stateTax)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">You keep</p>
                  <p className="text-base font-semibold text-primary">
                    {formatCurrency(inheritedAmount - stateTax)}
                  </p>
                </div>
              </div>
              {selectedClass?.rateRange && (
                <p className="text-xs text-muted/70 mt-3 italic">
                  This class uses graduated rates from {formatPercent(selectedClass.rateRange.min)} to{' '}
                  {formatPercent(selectedClass.rateRange.max)}. The figure above uses the midpoint rate as
                  an estimate — your exact rate depends on the specific bracket your inherited amount falls
                  into.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {mode === 'federal' && (
        <>
          {/* Marital status */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Marital status
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setIsMarried(false)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                  ${!isMarried
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-muted border-border hover:border-primary/40'
                  }`}
              >
                Single
              </button>
              <button
                onClick={() => setIsMarried(true)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                  ${isMarried
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-muted border-border hover:border-primary/40'
                  }`}
              >
                Married (with portability)
              </button>
            </div>
          </div>

          {/* Estate value */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Total estate value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">$</span>
              <input
                type="number"
                min="0"
                step="100000"
                value={estateValue}
                onChange={(e) => setEstateValue(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-surface pl-6 pr-3 py-2.5 text-sm text-body
                           focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Rate summary */}
          <div className="rounded-lg bg-bg border border-border px-4 py-3 mb-4 text-xs text-muted space-y-1">
            <div className="flex justify-between">
              <span>Federal exemption ({isMarried ? 'married, portability' : 'individual'})</span>
              <span className="font-mono text-body">{formatCurrency(federalResult.exemption)}</span>
            </div>
            <div className="flex justify-between">
              <span>Top rate on amount above exemption</span>
              <span className="font-mono text-body">{formatPercent(federal.topRate)}</span>
            </div>
          </div>

          <div className="mb-4">
            <LastUpdatedBadge lastUpdated={lastUpdated} />
          </div>

          {/* Results */}
          <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-4">
            <p className="text-xs text-muted mb-3">
              Federal estate tax on an estate worth{' '}
              <strong className="text-body">{formatCurrency(estateValue)}</strong>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1">Taxable amount</p>
                <p className="text-base font-semibold text-muted">
                  {formatCurrency(federalResult.taxableAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Estate tax owed</p>
                <p className="text-base font-semibold text-accent">{formatCurrency(federalResult.tax)}</p>
              </div>
            </div>
            {federalResult.tax === 0 && (
              <p className="text-xs text-muted/70 mt-3 italic">
                No federal estate tax owed — this estate is below the {formatCurrency(federalResult.exemption)}{' '}
                exemption.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}