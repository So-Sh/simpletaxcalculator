interface LastUpdatedBadgeProps {
    lastUpdated: string
}

export default function LastUpdatedBadge({ lastUpdated }: LastUpdatedBadgeProps) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            Rates updated for {lastUpdated}
        </span>
    )
}