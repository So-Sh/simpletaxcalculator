import type { Metadata } from 'next'
import Link from 'next/link'
import Image from "next/image";

export const metadata: Metadata = {
  title: 'About Us — Simple Tax Calculator',
  description:
    'Simple Tax Calculator is an independent US tax tools platform operated by Kobina AB. Learn about our team, editorial process, and how our calculators are built.',
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

function TeamMember({
  name,
  title,
  linkedIn,
  photo,
  children,
}: {
  name: string
  title: string
  linkedIn?: string
  photo: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-5 mb-8 last:mb-0">
      {/* Photo placeholder — replace with next/image once headshots are available */}
      <div className="w-16 h-16 rounded-full overflow-hidden border border-border flex-shrink-0">
        <Image
          src={photo}
          alt={name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>


      <div className="flex-1">
        <p className="font-semibold text-primary text-sm">{name}</p>
        <p className="text-xs text-accent mb-2">{title}</p>
        <div className="text-sm text-muted leading-relaxed space-y-2">{children}</div>
        {linkedIn && (
          <a
            href={linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline
                       underline-offset-2 mt-2"
          >
            View LinkedIn profile
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 8L8 2M8 2H4M8 2v4" stroke="currentColor" strokeWidth="1.25"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold
                       flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </span>
      <p className="text-sm text-muted leading-relaxed">{children}</p>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-2">simpletaxcalculator.app</p>
        <h1 className="text-3xl font-semibold text-primary mb-3">About Simple Tax Calculator</h1>
        <p className="text-sm text-muted leading-relaxed">
          Simple Tax Calculator is an independent US tax calculator platform built to make
          tax estimation practical, transparent, and accessible. We cover sales tax, capital
          gains, property tax, gas tax, inheritance tax, and self-employment tax — with
          state-specific rates sourced directly from official government sources.
        </p>
        <p className="text-sm text-muted leading-relaxed mt-2">
          The platform is operated by{' '}
          <Link href="https://kobina.se" target='_blank' className="hover:text-primary transition-colors underline underline-offset-2">
            Kobina
          </Link>          
          , a software and digital service
          company based in Stockholm, Sweden.
        </p>

        {/* Disclaimer — near top for YMYL */}
        <div className="mt-5 rounded-lg border border-border bg-bg px-4 py-3">
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-body">Important:</strong> This platform is provided for
            informational purposes only and does not constitute tax, legal,
            or financial advice. Always consult a qualified tax professional for your specific
            situation.
          </p>
        </div>
      </div>

      {/* How calculators are built */}
      <Section title="How our calculators are built">
        <p className="text-sm text-muted leading-relaxed mb-5">
          Every calculator on this platform follows a structured review process combining
          professional financial oversight, verified data research, and rigorous technical
          implementation.
        </p>
        <div className="space-y-3">
          <Step n={1}>
            Tax rate data is collected from official state and federal sources — Department
            of Revenue websites, IRS publications, and official tax tables.
          </Step>
          <Step n={2}>
            Calculation methodology is reviewed and validated internally before development begins.
          </Step>
          <Step n={3}>
            Technical implementation is developed and tested by our engineering team.
          </Step>
          <Step n={4}>
            Financial logic and assumptions are reviewed by an experienced accounting and financial compliance professional.
          </Step>
          <Step n={5}>
            Calculators are monitored and updated when authorities publish rate changes.
          </Step>
        </div>
        <p className="text-sm text-muted leading-relaxed mt-5">
          We do not rely exclusively on third-party aggregators for rate data. Where
          available, each calculator page links directly to the relevant official source so
          users can verify rates independently.
        </p>
      </Section>

      {/* Team */}
      <Section title="Our team">
        <TeamMember
          name="Talha Mansoor, FCCA"
          title="Lead Financial Reviewer"
          photo="/team/talha.png"
          linkedIn="https://linkedin.com/in/talha-mansoor-fcca-fmva"
        >
          <p>
            Talha is a Fellow of the Association of Chartered Certified Accountants (FCCA)
            and a certified Financial Modeling &amp; Valuation Analyst (FMVA) with over 15
            years of experience in statutory compliance, financial controllership, and
            international accounting across more than 30 jurisdictions.
          </p>
          <p>
            His career includes roles as Audit Executive at Ernst &amp; Young, Statutory
            Compliance Accountant at Google, Statutory Compliance Manager at Pure Storage,
            and International Financial Controller at Cardinal Health — giving him direct
            experience with multi-jurisdiction tax compliance, statutory audit, and financial
            reporting under IFRS, US GAAP, and multiple local GAAP frameworks.
          </p>
          <p>
            Talha reviews the financial logic, tax assumptions, and calculation methodologies
            used across our calculator suite, ensuring our rate data and formulas reflect
            real-world tax practice.
          </p>
        </TeamMember>

        <TeamMember
          name="Ray Alamian"
          title="Data Research Contributor"
          photo="/team/ray.jpg"
          linkedIn="https://linkedin.com/in/ray-alamian-990b1080"

        >
          <p>
            Ray contributes to tax data collection, source verification, and structured data
            management for the platform. His background includes data reporting systems, 
            compliance processes, and operational data analytics, with
            experience at Siemens Energy and Siemens Gamesa Renewable Energy.
          </p>
          <p>
            His role focuses on cross-referencing tax rate data against official Department
            of Revenue publications, identifying rate changes, and maintaining the accuracy
            of our state and county-level datasets.
          </p>
        </TeamMember>

        <TeamMember
          name="Saeed Davari"
          title="Technical Architect"
          photo="/team/saeed.jpg"
          linkedIn="https://www.linkedin.com/in/saeed-davari-3a218511b/"
            >
          <p>
            Saeed is a senior software developer and solutions architect and is responsible
            for the technical architecture, calculation logic, infrastructure, and ongoing
            maintenance of the platform.
          </p>
        </TeamMember>

        {/* Additional contributors note */}
        <div className="mt-6 rounded-lg border border-border bg-bg px-4 py-3">
          <p className="text-sm text-muted leading-relaxed">
            <strong className="text-body">Additional contributors:</strong> Tax data research,
            data verification, and software development are also supported by a broader group
            of freelance contributors. These individuals work under the same editorial
            standards as our core team.
          </p>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <p className="text-sm text-muted leading-relaxed mb-1">
          General inquiries and editorial questions:
        </p>
        <a
          href="mailto:contact@simpletaxcalculator.app"
          className="text-sm text-accent hover:underline underline-offset-2"
        >
          contact@simpletaxcalculator.app
        </a>
        <p className="text-xs text-muted mt-6">
          <Link href="/editorial-policy" className="hover:text-primary transition-colors underline underline-offset-2">
            Editorial Policy
          </Link>
          {' '}· Last reviewed: May 2026
        </p>
      </Section>

    </div>
  )
}