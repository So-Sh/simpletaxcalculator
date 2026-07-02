// app/blog/page.tsx

import { readFile, readdir } from 'fs/promises'
import path from 'path'
import type { Metadata } from 'next'
import Link from 'next/link'
import matter from 'gray-matter'
import { getAuthor } from '@/lib/authors'

const CONTENT_DIR = path.join(process.cwd(), 'content/blog')

export const metadata: Metadata = {
  title: 'Tax Insights & Research — simpletaxcalculator.app',
  description:
    'Original research and clear explainers on sales tax, property tax, inheritance tax, and more. Sourced from official state and federal data.',
}

interface PostSummary {
  slug: string
  title: string
  description: string
  authorSlug: string
  publishedAt: string
  readingTimeMinutes?: number
  tags?: string[]
}

async function getAllPosts(): Promise<PostSummary[]> {
  let files: string[] = []
  try {
    files = await readdir(CONTENT_DIR)
  } catch {
    return []
  }

  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith('.mdx'))
      .map(async (file) => {
        const raw = await readFile(path.join(CONTENT_DIR, file), 'utf-8')
        const { data } = matter(raw)
        return {
          slug: file.replace(/\.mdx$/, ''),
          title: data.title,
          description: data.description,
          authorSlug: data.author,
          publishedAt: data.publishedAt,
          readingTimeMinutes: data.readingTimeMinutes,
          tags: data.tags,
        }
      })
  )

  // Most recent first
  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export default async function BlogIndexPage() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen bg-bg">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="section-label mb-3">Research &amp; insights</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-primary leading-tight mb-3">
            Tax data, explained clearly
          </h1>
          <p className="text-base text-muted leading-relaxed max-w-xl">
            Original research and plain-language explainers on sales tax, property tax,
            inheritance tax, and more, sourced from official state and federal data.
          </p>
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="tool-card text-center py-12">
            <p className="text-sm text-muted">No posts published yet. Check back soon.</p>
          </div>
        )}

        {/* Post grid */}
        {posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {posts.map((post) => {
              const author = post.authorSlug ? getAuthor(post.authorSlug) : null
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="tool-card flex flex-col h-full group transition-all duration-200
                             hover:border-accent/40 hover:shadow-md"
                >
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold tracking-wider text-accent
                                     bg-accent/10 px-2 py-0.5 rounded-full uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="text-base font-semibold text-primary mb-2 leading-snug
                                 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-sm text-muted leading-relaxed flex-1 mb-4">
                    {post.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted pt-3 border-t border-border">
                    {author && <span className="font-medium text-body">{author.name}</span>}
                    {author && post.publishedAt && <span className="text-border">·</span>}
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    )}
                    {post.readingTimeMinutes && (
                      <>
                        <span className="text-border">·</span>
                        <span>{post.readingTimeMinutes} min read</span>
                      </>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </section>
    </div>
  )
}