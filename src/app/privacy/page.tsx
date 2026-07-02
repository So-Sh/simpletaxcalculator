// app/privacy/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { PolicyLayout, PolicySection, PolicyBulletList } from '@/components/ui/PolicyLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy — simpletaxcalculator.app',
  description:
    'Learn how simpletaxcalculator.app collects, uses, and protects information, including cookies, analytics, and advertising technologies.',
}

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      label="simpletaxcalculator.app"
      title="Privacy Policy"
      description="This Privacy Policy explains what information we collect, how it is used, and the choices you have when using our website."
      lastReviewed="July 2026"
    >
      <PolicySection title="1. Information We Collect">
        <p className="text-sm text-muted leading-relaxed">
          You can use simpletaxcalculator.app without creating an account or
          providing personal information.
        </p>

        <p className="text-sm text-muted leading-relaxed mt-3">
          Our calculators are designed to process your inputs within your web
          browser. We do not store your calculation inputs or associate them
          with your identity.
        </p>

        <p className="text-sm text-muted leading-relaxed mt-3">
          Like most websites, our hosting providers and third-party services may
          automatically receive limited technical information such as your IP
          address, browser type, operating system, and referring website in
          order to operate and secure the platform.
        </p>
      </PolicySection>

      <PolicySection title="2. Cookies and Advertising">
        <p className="text-sm text-muted leading-relaxed">
          We display advertisements to help keep our calculators free to use.
          Advertising partners may use cookies and similar technologies to measure ad
          performance, prevent fraud, and show more relevant advertisements.
        </p>

        <p className="text-sm text-muted leading-relaxed mt-3">
          These technologies are governed by the privacy policies of the
          respective advertising providers.
        </p>
      </PolicySection>

      <PolicySection title="3. Analytics">
        <p className="text-sm text-muted leading-relaxed">
          We use Google Analytics (GA4) to better understand how visitors use
          our website. This helps us improve our calculators, identify popular
          content, and understand overall website performance.
        </p>

        <p className="text-sm text-muted leading-relaxed mt-3">
          Analytics data may include information such as pages visited, browser
          type, approximate location, device type, referral source, and how long
          visitors spend on the site. We do not use Google Analytics to identify
          individual users.
        </p>
      </PolicySection>

      <PolicySection title="4. Your Privacy Choices">
        <p className="text-sm text-muted leading-relaxed">
          Depending on where you live, you may have privacy rights under
          applicable laws, including the GDPR and, where applicable, the
          California Consumer Privacy Act (CCPA).
        </p>

        <PolicyBulletList
          items={[
            'You can manage or delete cookies through your web browser settings.',
            'Where required, our cookie consent banner allows you to manage your consent preferences.',
            'Because we do not maintain user accounts or store calculator inputs, we are generally unable to identify individual users from our operational data.',
          ]}
        />
      </PolicySection>

      <PolicySection title="5. Third-Party Services">
        <p className="text-sm text-muted leading-relaxed">
          Our website relies on third-party services such as analytics,
          advertising, hosting, and embedded content providers. These services
          operate under their own privacy policies, and we encourage you to
          review them if you would like more information about how they process
          data.
        </p>
      </PolicySection>

      <PolicySection title="6. Changes to This Policy">
        <p className="text-sm text-muted leading-relaxed">
          We may update this Privacy Policy from time to time to reflect changes
          in our services, legal requirements, or the technologies we use. The
          "Last reviewed" date indicates when this policy was most recently
          updated.
        </p>
      </PolicySection>

      <PolicySection title="7. Contact">
        <p className="text-sm text-muted leading-relaxed mb-1">
          If you have questions about this Privacy Policy or our privacy
          practices, please contact us at:
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
          </Link>
          {' '}· Last reviewed: July 2026
        </p>
      </PolicySection>
    </PolicyLayout>
  )
}