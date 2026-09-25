// components/tax/AssumptionsBanner.tsx
//
// Discloses the national assumptions behind the Home Affordability
// Estimator (mortgage rate, insurance, PMI, DTI ratio). Separate from
// DisclaimerBanner because this estimator draws on several sourced
// assumptions rather than one official rate — each needs its own
// attribution and its own "this is an assumption, not a county-specific
// figure" label, per CLAUDE.md's wording rules for this feature.

interface AssumptionsBannerProps {
    mortgageRate: number
    rateSource: string
    rateSourceUrl: string
    rateDataAsOf: string
    insuranceAssumptionPct: number
    insuranceAssumptionLabel: string
    pmiAssumptionPct: number
    pmiAssumptionLabel: string
    dtiRatio: number
}

function formatPercent(n: number, digits = 2) {
    return (n * 100).toFixed(digits) + '%'
}

export default function AssumptionsBanner({
    mortgageRate,
    rateSource,
    rateSourceUrl,
    rateDataAsOf,
    insuranceAssumptionPct,
    insuranceAssumptionLabel,
    pmiAssumptionPct,
    pmiAssumptionLabel,
    dtiRatio,
}: AssumptionsBannerProps) {
    return (
        <div className="tool-card border-accent/20 bg-accent/5">
            <h2 className="text-sm font-semibold text-primary mb-3">
                Assumptions used in this estimator
            </h2>
            <dl className="space-y-3 text-sm">
                <div>
                    <dt className="font-medium text-body">
                        Mortgage rate assumption: {formatPercent(mortgageRate)}
                    </dt>
                    <dd className="text-xs text-muted mt-0.5">
                        <a
                            href={rateSourceUrl}
                            className="text-accent hover:underline underline-offset-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {rateSource}
                        </a>
                        , as of {rateDataAsOf}. This is a national average, not a
                        rate quote — your actual rate will vary by credit score,
                        loan type, and lender.
                    </dd>
                </div>

                <div>
                    <dt className="font-medium text-body">
                        Insurance assumption: {formatPercent(insuranceAssumptionPct)} of home value/year
                    </dt>
                    <dd className="text-xs text-muted mt-0.5">{insuranceAssumptionLabel}</dd>
                </div>

                <div>
                    <dt className="font-medium text-body">
                        PMI assumption: {formatPercent(pmiAssumptionPct)} of loan amount/year
                    </dt>
                    <dd className="text-xs text-muted mt-0.5">{pmiAssumptionLabel}</dd>
                </div>

                <div>
                    <dt className="font-medium text-body">
                        Housing-cost ratio: {formatPercent(dtiRatio, 0)} of gross income
                    </dt>
                    <dd className="text-xs text-muted mt-0.5">
                        A simplified rule-of-thumb applied to gross household income only.
                        Existing debts (car loans, student loans, credit cards, etc.) are
                        not modeled. This is not a lender underwriting calculation.
                    </dd>
                </div>
            </dl>
        </div>
    )
}