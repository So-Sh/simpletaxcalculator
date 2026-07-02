import Link from 'next/link'

const tools = [
    { label: 'Sales Tax Calculator', href: '/sales-tax' },
    { label: 'Capital Gains Calculator', href: '/capital-gains' },
    { label: 'Gas Tax Calculator', href: '/gas-tax' },
]

const company = [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Editorial Policy', href: '/editorial-policy' },
]

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="bg-primary text-white/70 mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                    <rect x="1" y="1" width="5" height="5" rx="1" fill="#06D6A0" />
                                    <rect x="8" y="1" width="5" height="5" rx="1" fill="#06D6A0" opacity="0.5" />
                                    <rect x="1" y="8" width="5" height="5" rx="1" fill="#06D6A0" opacity="0.5" />
                                    <rect x="8" y="8" width="5" height="5" rx="1" fill="#06D6A0" />
                                </svg>
                            </span>
                            <span className="text-white font-semibold text-sm">simpletaxcalculator.app</span>
                        </div>
                        <p className="text-sm leading-relaxed text-white/50 max-w-xs">
                            Free, accurate US tax calculators. Rates audited quarterly against official
                            state Department of Revenue sources.
                        </p>
                    </div>

                    {/* Tools */}
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Tools</p>
                        <ul className="space-y-2">
                            {tools.map((t) => (
                                <li key={t.href}>
                                    <Link href={t.href} className="text-sm hover:text-white transition-colors">
                                        {t.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Company</p>
                        <ul className="space-y-2">
                            {company.map((c) => (
                                <li key={c.href}>
                                    <Link href={c.href} className="text-sm hover:text-white transition-colors">
                                        {c.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/30">
                    <p>© {year} simpletaxcalculator.app</p>
                    <p>
                        For informational purposes only. Not tax advice.{' '}
                        {/* <Link href="/editorial-policy" className="hover:text-white/60 underline underline-offset-2 transition-colors">
                            Editorial policy
                        </Link> */}
                    </p>
                </div>
            </div>
        </footer>
    )
}