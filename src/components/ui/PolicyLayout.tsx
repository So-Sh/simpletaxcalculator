// components/ui/PolicyLayout.tsx
import React from 'react'

interface PolicyLayoutProps {
  label: string
  title: string
  description: string
  lastReviewed: string
  children: React.ReactNode
}

export function PolicyLayout({ label, title, description, lastReviewed, children }: PolicyLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-2">{label}</p>
        <h1 className="text-3xl font-semibold text-primary mb-3">{title}</h1>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
        <p className="text-xs text-muted mt-3">Last reviewed: {lastReviewed}</p>
      </div>
      {children}
    </div>
  )
}

export function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function PolicyBulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((item) => (
        <li key={item} className="flex gap-2 items-start text-sm text-muted leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
          {item}
        </li>
      ))}
    </ul>
  )
}