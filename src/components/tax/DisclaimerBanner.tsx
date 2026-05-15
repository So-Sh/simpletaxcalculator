interface DisclaimerBannerProps {
    lastUpdated: string
    officialSourceUrl?: string
    officialSourceLabel?: string
}

export default function DisclaimerBanner({
    lastUpdated,
    officialSourceUrl,
    officialSourceLabel,
}: DisclaimerBannerProps) {
    return (
        <div className="rounded-lg border border-border bg-bg px-4 py-3 flex gap-3 items-start">
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-muted flex-shrink-0 mt-0.5"
            >
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col gap-1">
                <p className="text-xs text-muted leading-relaxed">
                    This calculator is for informational purposes only and does not constitute tax advice.
                    Consult a qualified tax professional for your specific situation.{' '}
                    Rates last verified{' '}
                    <strong className="text-body font-medium">{lastUpdated}</strong>.
                </p>
                {officialSourceUrl && officialSourceLabel && (
                    <a
                        href={officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline underline-offset-2 inline-flex items-center gap-1 w-fit"
                    >
                        Verify rates on {officialSourceLabel}
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                                d="M2 8L8 2M8 2H4M8 2v4"
                                stroke="currentColor"
                                strokeWidth="1.25"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </a>
                )}
            </div>
        </div>
    )
}