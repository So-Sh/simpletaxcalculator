// components/blog/HeroStat.tsx

interface HeroStatProps {
  label: string
  value: string
  subtext?: string
}

export function HeroStat({
  label,
  value,
  subtext,
}: HeroStatProps) {
  return (
    <div className="not-prose my-8 rounded-2xl border border-border bg-surface px-6 py-8 text-center">
      <p className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-2">
        {label}
      </p>

      <div className="text-5xl sm:text-6xl font-bold text-accent">
        {value}
      </div>

      {subtext && (
        <p className="mt-3 text-sm text-muted">
          {subtext}
        </p>
      )}
    </div>
  )
}