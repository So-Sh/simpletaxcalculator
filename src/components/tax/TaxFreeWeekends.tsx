interface TaxFreeWeekendsProps {
    stateName: string | null
    events: { name: string; dates: string; items: string }[]
}

export default function TaxFreeWeekends({ stateName, events }: TaxFreeWeekendsProps) {
    if (!events || events.length === 0) return null

    return (
        <div className="tool-card">
            <h2 className="text-base font-semibold text-primary mb-1">
                {stateName ? `${stateName} tax-free weekends` : 'Tax-free weekends'}
            </h2>
            <p className="text-sm text-muted mb-4">
                Shop during these periods and pay no sales tax on qualifying items.
            </p>
            <div className="space-y-3">
                {events.map((event) => (
                    <div
                        key={event.name}
                        className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3"
                    >
                        <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="text-sm font-semibold text-primary">{event.name}</p>
                            <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                {event.dates}
                            </span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">{event.items}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}