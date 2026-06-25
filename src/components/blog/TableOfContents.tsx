// components/blog/TableOfContents.tsx

'use client'

import { useEffect, useState } from 'react'

interface TOCItem {
  label: string
  href: string
}

interface TableOfContentsProps {
  items?: TOCItem[]
  data?: string // Add this new prop
}

export function TableOfContents({ items: initialItems = [], data }: TableOfContentsProps) {
  const [activeHref, setActiveHref] = useState<string>('')

  let items = initialItems || []

  // If a data string is provided, safely parse it
  if (data) {
    try {
      items = JSON.parse(data)
    } catch (e) {
      console.error("Failed to parse TableOfContents JSON data", e)
    }
  }

  useEffect(() => {
    const headingIds = (items ?? []).map((i) => i.href.replace('#', ''))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`)
            break
          }
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    )

    headingIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  // If items didn't parse or are empty, don't display anything or break the page
  if (!items.length) return null

  return (
    <nav
      aria-label="Table of contents"
      className="my-8 rounded-xl border border-border bg-bg px-5 py-4"
    >
      <p className="text-[11px] font-semibold tracking-widest uppercase text-accent mb-3">
        In this post
      </p>
      <ol className="space-y-1">
        {items.map((item, i) => {
          const isActive = activeHref === item.href
          return (
            <li key={item.href}>
              <a
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-1.5
                  text-[0.875rem] transition-colors duration-100
                  ${isActive
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-muted hover:text-primary hover:bg-surface'
                  }
                `}
              >
                <span
                  className={`
                    shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                    text-[10px] font-semibold font-mono
                    ${isActive ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}
                  `}
                >
                  {i + 1}
                </span>
                {item.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}