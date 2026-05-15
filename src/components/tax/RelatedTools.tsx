import Link from 'next/link'

interface RelatedToolsProps {
    links: { label: string; href: string }[]
}

export default function RelatedTools({ links }: RelatedToolsProps) {
    return (
        <div className="tool-card">
            <h2 className="text-base font-semibold text-primary mb-4">Related calculators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border
                       text-sm text-body hover:border-accent/40 hover:text-primary
                       hover:bg-bg transition-all group"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            className="text-accent flex-shrink-0"
                        >
                            <path
                                d="M3 7h8M8 4l3 3-3 3"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}