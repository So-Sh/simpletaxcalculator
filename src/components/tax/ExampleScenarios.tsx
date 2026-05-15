interface ExampleScenariosProps {
    scenarios: { label: string; price: number; tax: number }[]
    stateName: string | null
}

function formatCurrency(n: number) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function ExampleScenarios({ scenarios, stateName }: ExampleScenariosProps) {
    return (
        <div className="tool-card">
            <h2 className="text-base font-semibold text-primary mb-1">
                Common examples{stateName ? ` in ${stateName}` : ''}
            </h2>
            <p className="text-sm text-muted mb-4">
                Based on the average combined rate for this area.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scenarios.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-lg border border-border bg-bg px-4 py-3 flex justify-between items-center"
                    >
                        <div>
                            <p className="text-sm font-medium text-body">{s.label}</p>
                            <p className="text-xs text-muted">{formatCurrency(s.price)} purchase</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-accent">{formatCurrency(s.tax)}</p>
                            <p className="text-xs text-muted">tax owed</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}