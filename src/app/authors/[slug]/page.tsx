import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getAuthor } from '@/lib/authors'

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const author = getAuthor(slug)

    if (!author) {
        return {
            title: 'Author Not Found',
        }
    }

    return {
        title: `${author.name} — Simple Tax Calculator`,
        description: author.shortBio,
        alternates: {
            canonical: `https://simpletaxcalculator.app/authors/${author.slug}`,
        },
        openGraph: {
            title: `${author.name} — Simple Tax Calculator`,
            description: author.shortBio,
            url: `https://simpletaxcalculator.app/authors/${author.slug}`,
            type: 'profile',
            images: [
                {
                    url: author.photo,
                    width: 400,
                    height: 400,
                    alt: author.name,
                },
            ],
        },
    }
}

export default async function AuthorPage({ params }: Props) {
    const { slug } = await params
    const author = getAuthor(slug)

    if (!author) {
        notFound()
    }

    const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: author.name,
        jobTitle: author.title,
        description: author.shortBio,
        image: `https://simpletaxcalculator.app${author.photo}`,
        url: `https://simpletaxcalculator.app/authors/${author.slug}`,
        sameAs: [author.linkedinUrl],
        worksFor: {
            '@type': 'Organization',
            name: 'Simple Tax Calculator',
            url: 'https://simpletaxcalculator.app',
        },
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

            {/* Structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(personSchema).replace(/</g, '\\u003c'),
                }}
            />

            {/* Breadcrumb */}
            <nav
                className="text-xs text-muted mb-8"
                aria-label="Breadcrumb"
            >
                <Link
                    href="/"
                    className="hover:text-primary transition-colors"
                >
                    Home
                </Link>
                {' / '}
                <Link
                    href="/about"
                    className="hover:text-primary transition-colors"
                >
                    About Us
                </Link>
                {' / '}
                <span className="text-primary">{author.name}</span>
            </nav>

            {/* Author header */}
            <div className="mb-10">
                <div className="flex flex-col sm:flex-row gap-6 items-start">

                    <div className="w-28 h-28 rounded-full overflow-hidden border border-border flex-shrink-0">
                        <Image
                            src={author.photo}
                            alt={author.name}
                            width={112}
                            height={112}
                            className="w-full h-full object-cover"
                            priority
                        />
                    </div>

                    <div className="flex-1">
                        <p className="section-label mb-2">
                            SIMPLE TAX CALCULATOR
                        </p>

                        <h1 className="text-3xl font-semibold text-primary mb-2">
                            {author.name}
                        </h1>

                        <p className="text-sm text-accent font-medium mb-3">
                            {author.title}
                        </p>

                        <p className="text-sm text-muted leading-relaxed">
                            {author.shortBio}
                        </p>

                        <a
                            href={author.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-accent hover:underline underline-offset-2 mt-4"
                        >
                            View LinkedIn profile
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M2 8L8 2M8 2H4M8 2v4"
                                    stroke="currentColor"
                                    strokeWidth="1.25"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Biography */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
                    About
                </h2>

                <div className="text-sm text-muted leading-relaxed space-y-4">
                    {author.bio.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </section>

            {/* Responsibilities */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
                    Role at Simple Tax Calculator
                </h2>

                <ul className="space-y-3">
                    {author.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                ✓
                            </span>

                            <p className="text-sm text-muted leading-relaxed">
                                {responsibility}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Editorial standards */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
                    Editorial Standards
                </h2>

                <p className="text-sm text-muted leading-relaxed">
                    Simple Tax Calculator uses official government publications and
                    primary sources when researching tax rates and rules. Financial
                    calculations and assumptions are subject to professional review,
                    while technical implementations are tested and maintained by the
                    development team.
                </p>

                <p className="text-sm text-muted leading-relaxed mt-3">
                    Learn more about our research, review, and publishing process in
                    our{' '}
                    <Link
                        href="/editorial-policy"
                        className="text-accent hover:underline underline-offset-2"
                    >
                        Editorial Policy
                    </Link>.
                </p>
            </section>

            {/* Back link */}
            <div className="pt-6 border-t border-border">
                <Link
                    href="/about"
                    className="text-sm text-accent hover:underline underline-offset-2"
                >
                    ← Meet the rest of our team
                </Link>
            </div>

        </div>
    )
}