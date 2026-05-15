interface FaqAccordionProps {
    faqs: { question: string; answer: string }[]
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
    return (
        <div className="tool-card">
            <h2 className="text-base font-semibold text-primary mb-4">
                Frequently asked questions
            </h2>
            <div className="space-y-2">
                {faqs.map((faq) => (
                    <details
                        key={faq.question}
                        className="group rounded-lg border border-border overflow-hidden"
                    >
                        <summary
                            className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer
                         text-sm font-medium text-body hover:bg-bg transition-colors list-none"
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
                        <div className="px-4 pb-4 pt-1 text-sm text-muted leading-relaxed border-t border-border bg-bg">
                            {faq.answer}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    )
}