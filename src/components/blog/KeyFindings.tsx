// components/blog/KeyFindings.tsx

interface KeyFindingsProps {
  items?: string[]
  data?: string
}

export function KeyFindings({
  items: initialItems = [],
  data,
}: KeyFindingsProps) {
  let items = initialItems

  if (data) {
    try {
      items = JSON.parse(data)
    } catch (e) {
      console.error('Failed to parse KeyFindings JSON', e)
    }
  }

  if (!items.length) return null

  return (
    <div className="not-prose my-8 rounded-xl border border-accent/20 bg-accent/5 p-5">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-accent mb-4">
        Key findings
      </p>

      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-3 text-sm leading-relaxed text-body"
          >
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}