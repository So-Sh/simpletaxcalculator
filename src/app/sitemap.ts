import type { MetadataRoute } from 'next'
import { getAllStates } from '@/lib/rates'

const BASE = 'https://simpletaxcalculator.app'

const NATIONAL_PILLARS = [
    '/sales-tax',
    '/property-tax',
    '/gas-tax',
    '/capital-gains',
]

export default function sitemap(): MetadataRoute.Sitemap {
    const states = getAllStates()

    const stateHubs: MetadataRoute.Sitemap = states.map((s) => ({
        url: `${BASE}/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }))

    // Driven by each state's availableTaxTypes in states-index.json. This only
    // includes a state + tax-type URL if that combination is listed there —
    // confirm property-tax/gas-tax/capital-gains have been added to
    // availableTaxTypes for each state alongside sales-tax, or those live
    // pages won't appear in the sitemap even though they exist and work.
    const stateToolPages: MetadataRoute.Sitemap = states.flatMap((s) =>
        s.availableTaxTypes.map((taxType) => ({
            url: `${BASE}/${s.slug}/${taxType}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        }))
    )

    const pillarPages: MetadataRoute.Sitemap = NATIONAL_PILLARS.map((path) => ({
        url: `${BASE}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    }))

    return [
        { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        ...pillarPages,
        ...stateHubs,
        ...stateToolPages,
    ]
}