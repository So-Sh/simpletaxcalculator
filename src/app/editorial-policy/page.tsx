import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Editorial Policy — Simple Tax Calculator',
  description:
    'How Simple Tax Calculator collects, reviews, validates, and maintains tax rate data. Our editorial standards, update policy, and correction process.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((item) => (
        <li key={item} className="flex gap-2 items-start text-sm text-muted leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function ReviewBlock({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4 mb-5 last:mb-0">
      <div className="w-1 rounded-full bg-accent flex-shrink-0 self-stretch" />
      <div>
        <p className="text-sm font-semibold text-primary mb-1">{label}</p>
        <p className="text-sm text-muted leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-2">simpletaxcalculator.app</p>
        <h1 className="text-3xl font-semibold text-primary mb-3">Editorial Policy</h1>
        <p className="text-sm text-muted leading-relaxed">
          This page explains how Simple Tax Calculator collects, reviews, validates, and
          maintains the tax rate data and calculation logic used across this platform.
        </p>
        <p className="text-xs text-muted mt-3">Last reviewed: May 2026</p>
      </div>

      {/* Principles */}
      <Section title="Our editorial principles">
        <p className="text-sm text-muted leading-relaxed">
          Accuracy, transparency, and clarity are central to how we build and maintain our
          tax calculators. We aim to:
        </p>
        <BulletList items={[
          'Use official government and tax authority sources whenever possible',
          'Present tax calculations in a simple and understandable format',
          'Clearly separate verified information from estimates or simplified assumptions',
          'Regularly review calculators and tax rate datasets',
          'Maintain transparency about how calculations are produced',
        ]} />
        <p className="text-sm text-muted leading-relaxed mt-4">
          Our content and calculators are designed to help users better understand common
          tax calculations — not to replace professional tax advice.
        </p>
      </Section>

      {/* Sources */}
      <Section title="Sources and data collection">
        <p className="text-sm text-muted leading-relaxed">
          Tax rates, thresholds, and related information are gathered from official public
          sources including:
        </p>
        <BulletList items={[
          'State Departments of Revenue and their published rate tables',
          'IRS publications, revenue procedures, and official notices',
          'Official state and local government tax documentation',
          'Government-published tax tables and legislative updates',
        ]} />
        <p className="text-sm text-muted leading-relaxed mt-4">
          We do not rely exclusively on third-party aggregators for tax rates. Each
          calculator page links to the relevant official source so users can verify
          rates independently.
        </p>
      </Section>

      {/* Review process */}
      <Section title="Review process">
        <p className="text-sm text-muted leading-relaxed mb-5">
          Our review process combines professional financial oversight, structured data
          research, and technical validation across three distinct roles.
        </p>

        <ReviewBlock label="Financial review">
          Calculator methodologies, tax assumptions, and rate logic are reviewed by{' '}
          <strong className="text-body">Talha Mansoor, FCCA</strong> — a Fellow of the
          Association of Chartered Certified Accountants with over 15 years of experience
          in statutory compliance, multi-jurisdiction tax reporting, and financial
          controllership. His review covers the financial accuracy of calculation logic
          and rate data before publication.
        </ReviewBlock>

        <ReviewBlock label="Data research and validation">
          Tax rate datasets are collected and verified by research contributors with
          experience in data systems, compliance reporting, and data
          analytics. Contributors cross-reference rate data against official state
          Department of Revenue websites before it is published.
        </ReviewBlock>

        <ReviewBlock label="Technical validation">
          Calculator implementation, formulas, and system logic are developed and
          maintained by our engineering team. All calculations are tested against known
          outputs before deployment to ensure they are stable, reproducible, and accurate.
        </ReviewBlock>
      </Section>

      {/* Update policy */}
      <Section title="Update policy">
        <p className="text-sm text-muted leading-relaxed">
          We review our rate datasets and calculators regularly. Updates are published when:
        </p>
        <BulletList items={[
          'State or local tax authorities publish new rates or thresholds',
          'Tax laws or regulations change at the state or federal level',
          'Errors or inconsistencies are identified internally or reported by users',
          'New jurisdictions or calculator features are added',
        ]} />
        <p className="text-sm text-muted leading-relaxed mt-4">
          Update frequency varies by tax category and the publication schedules of the
          relevant authorities. The date of the most recent rate verification is displayed
          on each calculator page.
        </p>
      </Section>

      {/* Error correction */}
      <Section title="Error correction">
        <p className="text-sm text-muted leading-relaxed">
          If you identify an error in our data or calculation logic, please contact us at{' '}
          <a
            href="mailto:contact@simpletaxcalculator.app"
            className="text-accent hover:underline underline-offset-2"
          >
            contact@simpletaxcalculator.app
          </a>
          . We review all correction requests within 5 business days and publish corrections
          promptly when verified.
        </p>
      </Section>

      {/* Independence */}
      <Section title="Independence">
        <p className="text-sm text-muted leading-relaxed">
          Simple Tax Calculator is independently operated by Kobina AB, based
          in Stockholm, Sweden. We do not accept payment to feature, promote, or modify
          tax rate data.
        </p>
        <p className="text-sm text-muted leading-relaxed mt-3">
          Our contributors and reviewers may hold positions in other organizations. These
          external roles do not influence our editorial standards or review process. We
          maintain a clear separation between financial review, data collection, and
          technical implementation.
        </p>
      </Section>

      {/* Limitations */}
      <Section title="Limitations">
        <p className="text-sm text-muted leading-relaxed">
          Our calculators provide simplified estimates based on publicly available rate
          data. They do not account for all individual circumstances, exemptions, credits,
          or jurisdiction-specific rules that may affect a user's actual tax liability.
          Users should verify tax matters with official government sources or consult a
          licensed tax professional before making financial decisions.
        </p>
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <p className="text-sm text-muted leading-relaxed mb-1">
          Editorial questions and correction requests:
        </p>
        <a
          href="mailto:contact@simpletaxcalculator.app"
          className="text-sm text-accent hover:underline underline-offset-2"
        >
          contact@simpletaxcalculator.app
        </a>
        <p className="text-xs text-muted mt-6">
          <Link href="/about" className="hover:text-primary transition-colors underline underline-offset-2">
            About Us
          </Link>
          {' '}· Last reviewed: May 2026
        </p>
      </Section>

    </div>
  )
}