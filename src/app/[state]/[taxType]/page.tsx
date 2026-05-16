import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import TaxCalculator from '@/components/tax/TaxCalculator'
import DisclaimerBanner from '@/components/tax/DisclaimerBanner'
import FormulaExplainer from '@/components/tax/FormulaExplainer'
import RateTable from '@/components/tax/RateTable'
import ExampleScenarios from '@/components/tax/ExampleScenarios'
import TaxFreeWeekends from '@/components/tax/TaxFreeWeekends'
import FaqAccordion from '@/components/tax/FaqAccordion'
import RelatedTools from '@/components/tax/RelatedTools'
import { getTaxTypeData, getAllStateAndTaxTypeSlugs } from '@/lib/rates'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

interface Props {
    params: Promise<{ state: string; taxType: string }>
}

export async function generateStaticParams() {
    return getAllStateAndTaxTypeSlugs()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { state: slug, taxType } = await params
    const data = getTaxTypeData(slug, taxType)
    if (!data) return {}

    const rate = (data.rates.state * 100).toFixed(2)
    const taxLabel = taxType.replace(/-/g, ' ')

    return {
        title: `${data.stateName} ${taxLabel} calculator 2026 — simpletaxcalculator.app`,
        description: `Calculate ${data.stateName} ${taxLabel} instantly. Includes county rates, real examples, and ${data.stateName}'s ${rate}% state rate. Rates updated for ${data.lastUpdated}.`,
    }
}

export default async function StateTaxTypePage({ params }: Props) {
    const { state: slug, taxType } = await params
    const data = getTaxTypeData(slug, taxType)

    if (!data) notFound()

    const taxLabel = taxType.replace(/-/g, ' ')
    const appSchema = webApplicationSchema(`${data.stateName} ${taxLabel} calculator`)
    const faqSchemaData = faqSchema(data.faqs)

    return (
        <>
            <Script id="schema-webapp" type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
            <Script id="schema-faq" type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }} />

            <ToolPageLayout>
                {/* Breadcrumb */}
                <p className="text-xs text-muted">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    {' / '}
                    <Link href={`/${slug}`} className="hover:text-primary transition-colors capitalize">
                        {data.stateName}
                    </Link>
                    {' / '}
                    <span className="text-body capitalize">{taxLabel}</span>
                </p>

                {/* Page header */}
                <div>
                    <h1 className="text-3xl font-semibold text-primary mb-2 capitalize">
                        {data.stateName} {taxLabel} Calculator
                    </h1>
                    <p className="text-sm text-muted leading-relaxed max-w-xl">
                        {data.customIntro}
                    </p>
                </div>

                {/* Calculator — always first, above the fold */}
                <TaxCalculator
                    rates={data.rates}
                    counties={data.counties}
                    stateName={data.stateName}
                    lastUpdated={data.lastUpdated}
                />

                {/* Disclaimer — immediately below calculator, YMYL required */}
                <DisclaimerBanner lastUpdated={data.lastUpdated} officialSourceUrl='test' officialSourceLabel={data.lastUpdated} />

                {/* Formula */}
                <FormulaExplainer formula={data.formula} example={data.example} />

                {/* County rate table */}
                <RateTable
                    rows={data.counties}
                    caption={`${data.stateName} ${taxLabel} rates by county`}
                />

                {/* Real-world examples */}
                <ExampleScenarios scenarios={data.scenarios} stateName={data.stateName} />

                {/* Tax-free weekends — renders null if none */}
                <TaxFreeWeekends stateName={data.stateName} events={data.taxFreeWeekends} />

                {/* FAQ */}
                <FaqAccordion faqs={data.faqs} />

                {/* Internal links */}
                <RelatedTools links={data.relatedTools} />
            </ToolPageLayout>
        </>
    )
}