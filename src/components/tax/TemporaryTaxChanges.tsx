
import Link from 'next/link'

interface TaxChange {
  state: string
  slug: string
  note: string
  sourceUrl: string
  until: string
}

interface Props {
  changes: TaxChange[]
}

export default function TemporaryTaxChanges({ changes }: Props) {
  const today = new Date().toISOString().slice(0, 10)

  const activeChanges = changes.filter(
    (change) => change.until >= today
  )

  if (activeChanges.length === 0) return null

  return (
    <section
      aria-labelledby="temporary-tax-changes-heading"
      className="rounded-xl border border-amber-300/60 bg-amber-50/50 p-4 sm:p-5"
    >
      <div className="mb-4">
        <h2
          id="temporary-tax-changes-heading"
          className="text-lg font-semibold text-primary"
        >
          Temporary State Gas Tax Changes
        </h2>
        <p className="mt-1 text-sm text-muted">
          Some states have temporary fuel tax changes.
          Check the effective dates and official notices
          before calculating your tax.
        </p>
      </div>

      <ul className="space-y-3">
        {activeChanges.map((change) => (
          <li
            key={change.slug}
            className="border-t border-amber-300/40 pt-3 first:border-0 first:pt-0"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link
                href={`/${change.slug}/gas-tax`}
                className="font-semibold text-primary hover:underline"
              >
                {change.state} gas tax
              </Link>

              <span className="text-xs text-muted">
                Through{' '}
                {new Date(
                  `${change.until}T12:00:00`
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
              </span>
            </div>

            <p className="mt-1 text-sm leading-relaxed text-body">
              {change.note}
            </p>

            <a
              href={change.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
            >
              Official source ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
