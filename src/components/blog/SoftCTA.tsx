// components/blog/SoftCTA.tsx

interface SoftCTAProps {
  heading: string
  body: string
  buttonText: string
  buttonHref: string
}

// Deliberately not a dark, high-contrast "convert now" banner like Vorna's
// CTABanner — this site has nothing to sign up for, so a loud sales-style
// unit would feel out of place. This is a quiet, on-brand prompt to use a
// related tool, styled like the rest of the site's tool-card pattern rather
// than a marketing block.
export function SoftCTA({ heading, body, buttonText, buttonHref }: SoftCTAProps) {
  return (
    <div className="not-prose my-10 rounded-xl border border-border bg-bg px-6 py-6 flex flex-col sm:flex-row sm:items-center gap-5">
      <div className="flex-1">
        <p className="text-base font-semibold text-primary leading-snug mb-1">
          {heading}
        </p>
        <p className="text-sm text-muted leading-relaxed">
          {body}
        </p>
      </div>
      <a
        href={buttonHref}
        className="
          shrink-0 inline-flex items-center justify-center
          rounded-lg bg-accent hover:bg-accent/90
          text-sm text-white! font-semibold
          px-5 py-2.5 min-h-[44px]
          transition-colors duration-150
          whitespace-nowrap
        "
      >
        {buttonText}
      </a>
    </div>
  )
}