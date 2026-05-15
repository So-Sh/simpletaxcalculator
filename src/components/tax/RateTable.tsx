interface RateTableProps {
    rows: { name: string; rate: number }[]
    caption: string
}

function formatPercent(n: number) {
    return (n * 100).toFixed(3).replace(/\.?0+$/, '') + '%'
}

export default function RateTable({ rows, caption }: RateTableProps) {
    if (rows.length < 5) return null

    return (
        <div className="tool-card">
            <h2 className="text-base font-semibold text-primary mb-4">{caption}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Location
                            </th>
                            <th className="text-right py-2 text-xs font-semibold text-muted uppercase tracking-wider">
                                Combined rate
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={row.name}
                                className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg/60'
                                    }`}
                            >
                                <td className="py-2.5 pr-4 text-body">{row.name}</td>
                                <td className="py-2.5 text-right font-mono font-medium text-primary">
                                    {formatPercent(row.rate)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}