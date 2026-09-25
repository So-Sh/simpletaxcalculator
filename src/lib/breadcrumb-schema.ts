// lib/breadcrumb-schema.ts
//
// ASSUMPTION: I don't have your actual lib/schema.ts source, so this is a
// standalone helper rather than an addition to that file. If you already
// have a base-URL constant elsewhere (e.g. lib/metadata.ts), replace SITE_URL
// below with that instead of maintaining a second copy.

const SITE_URL = 'https://simpletaxcalculator.app'

export interface BreadcrumbSchemaItem {
    label: string
    /** Site-relative path, e.g. '/ohio'. Omit on the last (current) item. */
    href?: string
}

export function breadcrumbSchema(items: BreadcrumbSchemaItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
        })),
    }
}