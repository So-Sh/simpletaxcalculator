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
    title: `${meta.name} Inheritance Tax Calculator 2026 — simpletaxcalculator.app`,
    description: `${meta.name} inheritance tax calculator coming soon. Estimate inheritance tax liability based on estate value and relationship to the deceased.`,
  }
}

export default async function StateInheritanceTaxPage({ params }: Props) {
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
        <span className="text-body">Inheritance Tax</span>
      </p>
      <ComingSoon
        title={`${meta.name} Inheritance Tax Calculator`}
        description={`The ${meta.name} inheritance tax calculator is coming soon. It will cover which states levy inheritance tax, applicable thresholds, and rates by heir relationship.`}
        backHref={`/${slug}`}
        backLabel={`Back to ${meta.name} tax calculators`}
      />
    </div>
  )
}