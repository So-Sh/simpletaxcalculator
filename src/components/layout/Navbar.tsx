'use client'

import Link from 'next/link'
import { useState } from 'react'

const tools = [
    { label: 'Sales Tax', href: '/sales-tax' },
    { label: 'Capital Gains', href: '/capital-gains' },
    { label: 'Gas Tax', href: '/gas-tax' },
]

export default function Navbar() {
    const [open, setOpen] = useState(false)

    return (
        <header className="bg-surface border-b border-border sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="1" y="1" width="5" height="5" rx="1" fill="#06D6A0" />
                            <rect x="8" y="1" width="5" height="5" rx="1" fill="#06D6A0" opacity="0.5" />
                            <rect x="1" y="8" width="5" height="5" rx="1" fill="#06D6A0" opacity="0.5" />
                            <rect x="8" y="8" width="5" height="5" rx="1" fill="#06D6A0" />
                        </svg>
                    </span>
                    <span className="font-semibold text-primary text-sm tracking-tight">
                        simple<span className="text-accent">tax</span>calculator
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {tools.map((tool) => (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            className="text-sm text-muted hover:text-primary px-3 py-1.5 rounded-md hover:bg-bg transition-colors"
                        >
                            {tool.label}
                        </Link>
                    ))}
                </nav>

                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 rounded-md text-muted hover:text-primary hover:bg-bg transition-colors"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                >
                    {open ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 2l14 14M16 2L2 16" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 5h14M2 9h14M2 13h14" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-1">
                    {tools.map((tool) => (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            onClick={() => setOpen(false)}
                            className="text-sm text-muted hover:text-primary px-3 py-2 rounded-md hover:bg-bg transition-colors"
                        >
                            {tool.label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    )
}