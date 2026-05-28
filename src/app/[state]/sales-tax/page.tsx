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
import { getTaxTypeData, getAllStateSlugs } from '@/lib/rates'
import { webApplicationSchema, faqSchema } from '@/lib/schema'

interface Props {
  params: Promise<{ state: string }>
}

export async function generateStaticParams() {
  return getAllStateSlugs()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: slug } = await params
  const data = getTaxTypeData(slug, 'sales-tax')
  if (!data) return {}

  const rate = (data.rates.state * 100).toFixed(2)

  return {
    title: `${data.stateName} Sales Tax Calculator 2026 — simpletaxcalculator.app`,
    description: `Calculate ${data.stateName} sales tax instantly. Includes county and city rates, real purchase examples, and ${data.stateName}'s ${rate}% state rate. Rates updated for ${data.lastUpdated}.`,
  }
}

export default async function StateSalesTaxPage({ params }: Props) {
  const { state: slug } = await params
  const data = getTaxTypeData(slug, 'sales-tax')
  if (!data) notFound()

  const appSchema = webApplicationSchema(`${data.stateName} Sales Tax Calculator`)
  const faqSchemaData = faqSchema(data.faqs)

  return (
    <>
      <Script id="schema-webapp" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <Script id="schema-faq" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }} />

      <ToolPageLayout>
        <p className="text-xs text-muted">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          {' / '}
          <Link href={`/${slug}`} className="hover:text-primary transition-colors">{data.stateName}</Link>
          {' / '}
          <span className="text-body">Sales Tax</span>
        </p>

        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            {data.stateName} Sales Tax Calculator
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-xl">{data.customIntro}</p>
        </div>

        <TaxCalculator
          rates={data.rates}
          counties={data.counties}
          stateName={data.stateName}
          lastUpdated={data.lastUpdated}
        />

        <DisclaimerBanner
          lastUpdated={data.lastUpdated}
          officialSourceUrl={data.officialSourceUrl}
          officialSourceLabel={data.officialSourceLabel}
        />

        <FormulaExplainer formula={data.formula} example={data.example} />

        <RateTable
          rows={data.counties}
          caption={`${data.stateName} sales tax rates by county`}
        />

        <ExampleScenarios scenarios={data.scenarios} stateName={data.stateName} />

        <TaxFreeWeekends stateName={data.stateName} events={data.taxFreeWeekends} />

        <FaqAccordion faqs={data.faqs} />

        <RelatedTools links={data.relatedTools} />
      </ToolPageLayout>
    </>
  )
}