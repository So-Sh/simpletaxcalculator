// components/layout/Breadcrumbs.tsx

import Link from 'next/link'

export interface BreadcrumbItem {
    label: string
    /** Omit on the last item — it renders as the current page, not a link. */
    href?: string
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1
                    return (
                        <li key={i} className="flex items-center gap-1.5">
                            {i > 0 && <span aria-hidden="true">/</span>}
                            {item.href && !isLast ? (
                                <Link prefetch={false} href={item.href}
                                    className="hover:text-accent hover:underline underline-offset-2">
                                    {item.label}
                                </Link>
                            ) : (
                                <span aria-current={isLast ? 'page' : undefined}
                                    className={isLast ? 'text-body font-medium' : ''}>
                                    {item.label}
                                </span>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}