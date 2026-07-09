// components/blog/FaqAccordion.tsx

interface Faq {
    question: string
    answer: string
}

interface FaqAccordionProps {
    faqs?: Faq[]
    data?: string // JSON string, matches the DataTable pattern used in MDX
    title?: string
}

export function FaqAccordion({ faqs: initialFaqs, data, title = 'Common questions' }: FaqAccordionProps) {
    let faqs: Faq[] = initialFaqs || []

    if (data) {
        try {
            const parsed = JSON.parse(data)
            if (Array.isArray(parsed)) faqs = parsed
        } catch (e) {
            console.error('Failed to parse FaqAccordion JSON data', e)
        }
    }

    if (!faqs.length) {
        return (
            <div className="p-4 border border-dashed border-red-500 rounded text-xs text-red-500 bg-red-50/50">
                FaqAccordion failed to load. Check JSON syntax.
            </div>
        )
    }

    const jsonLd = {
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

    return (
        <div className="not-prose my-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <h2 className="text-lg font-semibold text-primary mb-4">{title}</h2>
            <div className="space-y-2 rounded-xl border border-border overflow-hidden divide-y divide-border">
                {faqs.map((faq) => (
                    <details key={faq.question} className="group bg-surface open:bg-bg">
                        <summary
                            className="flex items-center justify-between gap-3 px-5 py-3.5 cursor-pointer
                         text-[0.9rem] font-medium text-body hover:bg-bg transition-colors list-none"
                        >
                            {faq.question}
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                className="flex-shrink-0 text-muted transition-transform group-open:rotate-180"
                            >
                                <path
                                    d="M2 5l5 5 5-5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </summary>
                        <div className="px-5 pb-4 pt-1 text-[0.9rem] text-muted leading-relaxed border-t border-border">
                            {faq.answer}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    )
}