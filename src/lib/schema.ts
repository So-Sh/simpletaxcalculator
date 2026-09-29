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
    // Entity publishing the tool
    author: {
      '@type': 'Organization',
      name: 'Kobina AB',
      url: 'https://simpletaxcalculator.app',
    },
    // Professional reviewing the calculation/tax logic
   reviewedBy: {
    '@type': 'Person',
    name: 'Talha Mansoor',
    jobTitle: 'Lead Financial Reviewer',
    honorificSuffix: 'FCCA, FMVA',
    sameAs: [
        'https://linkedin.com/in/talha-mansoor-fcca-fmva/',
    ],
}
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