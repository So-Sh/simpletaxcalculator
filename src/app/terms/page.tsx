// app/terms/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { PolicyLayout, PolicySection, PolicyBulletList } from '@/components/ui/PolicyLayout'

export const metadata: Metadata = {
  title: 'Terms of Service — simpletaxcalculator.app',
  description:
    'Terms of Service governing your use of the simpletaxcalculator.app platform and calculators.',
}

export default function TermsOfServicePage() {
  return (
    <PolicyLayout
      label="simpletaxcalculator.app"
      title="Terms of Service"
      description="Please read these Terms of Service carefully before using our platform. By accessing or using our tools, you agree to these terms."
      lastReviewed="July 2026"
    >
      <PolicySection title="1. Agreement to Terms">
        <p className="text-sm text-muted leading-relaxed">
          By accessing or using simpletaxcalculator.app, you agree to be bound by
          these Terms of Service. This platform is operated by Kobina AB,
          registered in Stockholm, Sweden. If you do not agree with these terms,
          you should not use our website or its tools.
        </p>
      </PolicySection>

      <PolicySection title="2. Not Financial or Tax Advice">
        <p className="text-sm text-muted leading-relaxed font-medium text-primary">
          Our calculators, estimators, articles, and other content are provided
          for informational and educational purposes only.
        </p>

        <p className="text-sm text-muted leading-relaxed mt-3">
          They are not a substitute for professional tax, legal, or financial
          advice. Tax outcomes depend on individual circumstances, applicable
          laws, filing status, deductions, exemptions, and local rules that
          cannot be fully reflected in a general-purpose calculator.
        </p>

        <PolicyBulletList
          items={[
            'Verify important tax information using official IRS, state, or local tax authority guidance before making financial decisions.',
            'Consult a qualified tax, legal, or financial professional before making significant financial or asset-related decisions.',
            'Tools identified as "Estimators" (such as our Property Tax Estimator) use statistical or regional data and should not be treated as official tax assessments.',
          ]}
        />
      </PolicySection>

      <PolicySection title="3. Intellectual Property">
        <p className="text-sm text-muted leading-relaxed">
          Unless otherwise stated, the calculators, original content, design,
          graphics, and underlying calculation logic on
          simpletaxcalculator.app are the intellectual property of Kobina AB.
          You may reference or link to our content, but you may not reproduce,
          redistribute, or republish substantial portions of the site without
          prior written permission.
        </p>
      </PolicySection>

      <PolicySection title="4. Acceptable Use">
        <p className="text-sm text-muted leading-relaxed">
          You agree to use this website only for lawful purposes. You must not:
        </p>

        <PolicyBulletList
          items={[
            'Attempt to interfere with the operation, security, or availability of the platform.',
            'Use automated methods to excessively scrape or overload our services.',
            'Misrepresent calculator results as official tax determinations.',
            'Use the website in violation of applicable laws or regulations.',
          ]}
        />
      </PolicySection>

      <PolicySection title="5. Limitation of Liability">
        <p className="text-sm text-muted leading-relaxed">
          To the fullest extent permitted by applicable law, Kobina AB, its
          contributors, and affiliates are not liable for any direct, indirect,
          incidental, or consequential damages arising from the use of this
          website, including calculation errors, outdated information, temporary
          service interruptions, or inaccuracies in publicly available tax data.
        </p>
      </PolicySection>

      <PolicySection title="6. Changes to These Terms">
        <p className="text-sm text-muted leading-relaxed">
          We may update these Terms of Service from time to time to reflect
          changes to our platform, applicable laws, or our services. The
          "Last reviewed" date indicates the most recent revision. Continued use
          of the website after changes become effective constitutes acceptance
          of the updated terms.
        </p>
      </PolicySection>

      <PolicySection title="7. Governing Law">
        <p className="text-sm text-muted leading-relaxed">
          These Terms of Service and any disputes arising from your use of the
          website are governed by the laws of Sweden, excluding its conflict of
          laws rules.
        </p>
      </PolicySection>

      <PolicySection title="8. Contact">
        <p className="text-sm text-muted leading-relaxed mb-1">
          If you have questions about these Terms of Service or need to send a
          legal notice, you can contact us at:
        </p>

        <a
          href="mailto:contact@simpletaxcalculator.app"
          className="text-sm text-accent hover:underline underline-offset-2"
        >
          contact@simpletaxcalculator.app
        </a>

        <p className="text-xs text-muted mt-6">
          <Link
            href="/about"
            className="hover:text-primary transition-colors underline underline-offset-2"
          >
            About Us
          </Link>{' '}
          · Last reviewed: July 2026
        </p>
      </PolicySection>
    </PolicyLayout>
  )
}