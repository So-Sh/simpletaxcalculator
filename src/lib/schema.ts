import type { TaxTypeData } from './types'

export function webApplicationSchema(name: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
    }
}

export function faqSchema(faqs: TaxTypeData['faqs']) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }
}