import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ComingSoon from '@/components/ComingSoon'
import { getStateMeta, getAllStateSlugs } from '@/lib/rates'

interface Props {
  params: Promise<{ state: string }>
}

export async function generateStaticParams() {
  return getAllStateSlugs()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: slug } = await params
  const meta = getStateMeta(slug)
  if (!meta) return {}

  return {
    title: `${meta.name} Self-Employment Tax Calculator 2026 — simpletaxcalculator.app`,
    description: `${meta.name} self-employment tax calculator coming soon. Estimate SE tax and quarterly estimated payments for freelancers and small business owners.`,
  }
}

export default async function StateSelfEmploymentTaxPage({ params }: Props) {
  const { state: slug } = await params
  const meta = getStateMeta(slug)
  if (!meta) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-xs text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        {' / '}
        <Link href={`/${slug}`} className="hover:text-primary transition-colors">{meta.name}</Link>
        {' / '}
        <span className="text-body">Self-Employment Tax</span>
      </p>
      <ComingSoon
        title={`${meta.name} Self-Employment Tax Calculator`}
        description={`The ${meta.name} self-employment tax calculator is coming soon. It will cover the 15.3% SE tax rate, the deductible half, quarterly estimated payments, and ${meta.name} state income tax for self-employed individuals.`}
        backHref={`/${slug}`}
        backLabel={`Back to ${meta.name} tax calculators`}
      />
    </div>
  )
}