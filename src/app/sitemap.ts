import type { MetadataRoute } from 'next'
import { getAllStates } from '@/lib/rates'

const BASE = 'https://simpletaxcalculator.app'

const NATIONAL_PILLARS = [
    '/sales-tax',
    '/property-tax',
    '/inheritance-tax',
    '/gas-tax',
    '/self-employment-tax',
]

export default function sitemap(): MetadataRoute.Sitemap {
    const states = getAllStates()

    const stateHubs: MetadataRoute.Sitemap = states.map((s) => ({
        url: `${BASE}/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }))

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