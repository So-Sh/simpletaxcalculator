// components/blog/ExampleBlock.tsx

import { ReactNode } from 'react'

interface ExampleBlockProps {
  children: ReactNode
  label?: string
}

export function ExampleBlock({ children, label = 'Example' }: ExampleBlockProps) {
  return (
    <div className="not-prose my-6 rounded-xl overflow-hidden border border-border">
      <div className="flex items-center gap-2 bg-primary px-4 py-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white opacity-70" />
        <span className="text-[11px] font-semibold tracking-widest uppercase text-white opacity-90">
          {label}
        </span>
      </div>
      <div className="bg-bg px-5 py-4 text-[0.9rem] leading-relaxed text-body">
        {children}
      </div>
    </div>
  )
}