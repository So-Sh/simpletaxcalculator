// components/blog/Callout.tsx

import { ReactNode } from 'react'

type CalloutType = 'tip' | 'warning' | 'info' | 'danger' | 'scope'

interface CalloutProps {
  children: ReactNode
  type?: CalloutType
  title?: string
}

// "scope" is a dedicated type for "What this does not measure" style boxes —
// distinct from "info" so it reads as a methodology boundary, not a general note.
const config: Record<
  CalloutType,
  { bg: string; border: string; icon: string; iconColor: string; labelColor: string; label: string }
> = {
  tip: {
    bg: 'bg-[#f0f9f4]',
    border: 'border-[#86efac]',
    icon: '✦',
    iconColor: 'text-[#16a34a]',
    labelColor: 'text-[#15803d]',
    label: 'Tip',
  },
  info: {
    bg: 'bg-accent/5',
    border: 'border-accent/30',
    icon: '◈',
    iconColor: 'text-accent',
    labelColor: 'text-primary',
    label: 'Note',
  },
  scope: {
    bg: 'bg-bg',
    border: 'border-border',
    icon: '◻',
    iconColor: 'text-muted',
    labelColor: 'text-primary',
    label: 'What this does not measure',
  },
  warning: {
    bg: 'bg-[#fff7ed]',
    border: 'border-[#fed7aa]',
    icon: '⬡',
    iconColor: 'text-[#f97316]',
    labelColor: 'text-[#c2410c]',
    label: 'Watch out',
  },
  danger: {
    bg: 'bg-[#fef2f2]',
    border: 'border-[#fca5a5]',
    icon: '▲',
    iconColor: 'text-[#ef4444]',
    labelColor: 'text-[#b91c1c]',
    label: 'Important',
  },
}

export function Callout({ children, type = 'info', title }: CalloutProps) {
  const c = config[type]
  return (
    <div className={`my-6 rounded-xl border ${c.bg} ${c.border} px-5 py-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-sm ${c.iconColor}`}>{c.icon}</span>
        <span className={`text-[11px] font-semibold tracking-widest uppercase ${c.labelColor}`}>
          {title ?? c.label}
        </span>
      </div>
      <div className="text-[0.9rem] leading-relaxed text-body">{children}</div>
    </div>
  )
}