import Link from 'next/link'

interface ComingSoonProps {
    title: string
    description: string
    backHref?: string
    backLabel?: string
}

export default function ComingSoon({
    title,
    description,
    backHref = '/',
    backLabel = 'Back to all calculators',
}: ComingSoonProps) {
    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">

            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center
                      mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {/* Badge */}
            <span className="inline-block text-xs font-semibold tracking-widest text-muted
                       bg-bg border border-border px-3 py-1 rounded-full uppercase mb-4">
                Coming soon
            </span>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-primary mb-3">{title}</h1>

            {/* Description */}
            <p className="text-sm text-muted leading-relaxed mb-8 max-w-md mx-auto">
                {description}
            </p>

            {/* Back link */}
            <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent
                   hover:underline underline-offset-2"
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {backLabel}
            </Link>

            {/* Disclaimer */}
            <p className="text-xs text-muted mt-12 pt-6 border-t border-border">
                All calculators are for informational purposes only and do not constitute tax advice.
                Consult a qualified tax professional for your specific situation.
            </p>
        </div>
    )
}