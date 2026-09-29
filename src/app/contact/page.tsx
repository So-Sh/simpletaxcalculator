// app/contact/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Us — simpletaxcalculator.app',
  description: 'Get in touch with the Simple Tax Calculator team for support, feedback, or data correction requests.',
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-primary mb-4">Contact Us</h1>
      <p className="text-sm text-muted leading-relaxed mb-6">
        Have questions, feedback, or a tax data correction request? We’d love to hear from you.
      </p>

      <div className="rounded-lg border border-border bg-bg p-6 max-w-md">
        <h2 className="text-base font-medium text-body mb-2">Email Support</h2>
        <p className="text-xs text-muted mb-4">
          For general inquiries, editorial questions, or reporting calculation discrepancies:
        </p>
        <a
          href="mailto:contact@simpletaxcalculator.app"
          className="text-sm font-semibold text-accent hover:underline"
        >
          contact@simpletaxcalculator.app
        </a>
      </div>

      <div className="mt-8 text-xs text-muted">
        <p>Operated by <strong>Kobina AB</strong> · Stockholm, Sweden</p>
        <p className="mt-1">
          Learn more about our review process on our{' '}
          <Link href="/about" className="underline hover:text-primary">
            About Us
          </Link>{' '}
          page.
        </p>
      </div>
    </div>
  )
}