interface FormulaExplainerProps {
    formula: string
    example: { price: number; tax: number; total: number }
}

function formatCurrency(n: number) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function FormulaExplainer({ formula, example }: FormulaExplainerProps) {
    return (
        <div className="tool-card">
            <h2 className="text-base font-semibold text-primary mb-4">How it's calculated</h2>

            {/* Formula */}
            <div className="rounded-lg bg-primary px-4 py-3 mb-4 font-mono text-sm text-accent">
                {formula}
            </div>

            {/* Step by step */}
            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold
                           flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                    </span>
                    <p className="text-sm text-body leading-relaxed">
                        Start with the <strong>purchase price</strong>:{' '}
                        <span className="font-mono">{formatCurrency(example.price)}</span>
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold
                           flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                    </span>
                    <p className="text-sm text-body leading-relaxed">
                        Multiply by the <strong>combined tax rate</strong> to get the tax amount:{' '}
                        <span className="font-mono text-accent">{formatCurrency(example.tax)}</span>
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold
                           flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                    </span>
                    <p className="text-sm text-body leading-relaxed">
                        Add tax to the purchase price for the{' '}
                        <strong>total amount due</strong>:{' '}
                        <span className="font-mono font-semibold text-primary">
                            {formatCurrency(example.total)}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}