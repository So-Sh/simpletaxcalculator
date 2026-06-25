// app/blog/[slug]/page.tsx

import { readFile, readdir } from 'fs/promises'
import path from 'path'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'

import { TableOfContents } from '@/components/blog/TableOfContents'
import { ExampleBlock } from '@/components/blog/ExampleBlock'
import { Callout } from '@/components/blog/Callout'
import { SoftCTA } from '@/components/blog/SoftCTA'
import { DataTable } from '@/components/blog/DataTable'
import { KeyFindings } from '@/components/blog/KeyFindings'
import { HeroStat } from '@/components/blog/HeroStat'

import { getAuthor } from '@/lib/authors'

const CONTENT_DIR = path.join(process.cwd(), 'content/blog')

const components = {
  TableOfContents,
  ExampleBlock,
  Callout,
  SoftCTA,
  DataTable,
  KeyFindings,
  HeroStat
}

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  try {
    const raw = await readFile(path.join(CONTENT_DIR, `${slug}.mdx`), 'utf-8')
    const { content, data } = matter(raw)
    return { content, frontmatter: data }
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  const files = await readdir(CONTENT_DIR)
  return files
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({ slug: f.replace(/\.mdx$/, '') }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const { frontmatter: fm } = post

  return {
    title: fm.title,
    description: fm.description,
    alternates: {
      canonical: fm.canonicalUrl,
    },
    openGraph: {
      title: fm.title,
      description: fm.description,
      type: 'article',
      publishedTime: fm.publishedAt,
      modifiedTime: fm.updatedAt,
      images: fm.ogImage ? [{ url: `https://simpletaxcalculator.app${fm.ogImage}` }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: fm.title,
      description: fm.description,
      images: fm.ogImage ? [`https://simpletaxcalculator.app${fm.ogImage}`] : [],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const { content, frontmatter: fm } = post

  // Author lookup — pulls bio/credentials from TEAM.md-backed data so the
  // byline carries real E-E-A-T weight (FCCA credentials for Talha, data
  // research scope for Ray) rather than just a plain name string.
  const author = fm.author ? getAuthor(fm.author) : null

  return (
    <div className="min-h-screen bg-bg">
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Meta header */}
        <header className="mb-10">
          {fm.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {fm.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-accent/10 text-accent text-[11px] font-semibold px-3 py-0.5 tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-[1.9rem] sm:text-[2.4rem] font-semibold text-primary leading-tight tracking-tight mb-3">
            {fm.title}
          </h1>

          {fm.description && (
            <p className="text-base text-muted leading-relaxed mb-5">
              {fm.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-[0.8rem] text-muted">
            {author && (
              <span className="font-medium text-body">{author.name}</span>
            )}
            {author && fm.publishedAt && (
              <span className="text-border">·</span>
            )}
            {fm.publishedAt && (
              <time dateTime={fm.publishedAt}>
                {new Date(fm.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            {fm.readingTimeMinutes && (
              <>
                <span className="text-border">·</span>
                <span>{fm.readingTimeMinutes} min read</span>
              </>
            )}
          </div>
        </header>

        {/* MDX content */}
       <div
          className="
            prose prose-slate max-w-none

            prose-headings:font-semibold
            prose-headings:text-primary
            prose-headings:tracking-tight

            [&_h2]:text-[1.4rem]
            [&_h2]:mt-12
            [&_h2]:mb-5

            [&_h3]:text-[1.1rem]
            [&_h3]:mt-8
            [&_h3]:mb-3

            prose-p:text-body
            prose-p:leading-relaxed
            prose-p:text-[0.95rem]

            prose-a:text-accent
            prose-a:font-medium
            prose-a:no-underline
            hover:prose-a:underline

            prose-strong:text-primary
            prose-strong:font-semibold

            prose-ul:text-[0.95rem]
            prose-ol:text-[0.95rem]
            prose-li:text-body
            prose-li:leading-relaxed

            prose-hr:border-border
            prose-hr:my-10

            prose-table:block
            prose-table:overflow-x-auto
            prose-table:text-[0.875rem]

            prose-th:text-primary
            prose-th:font-semibold
            prose-th:bg-bg

            prose-td:text-body

            prose-img:rounded-xl

            prose-blockquote:border-l-accent
            prose-blockquote:text-muted
          "
        >
          <MDXRemote
            source={content}
            components={components}
            options={{
              mdxOptions: {
                rehypePlugins: [rehypeSlug],
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>

        {/* Author bio footer — real credentials shown for E-E-A-T, per TEAM.md */}
        {author && (
          <footer className="mt-14 pt-8 border-t border-border">
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  About the author
                </p>
                <p className="text-sm font-semibold text-primary mb-1">{author.name}</p>
                {author.title && (
                  <p className="text-xs text-muted mb-2">{author.title}</p>
                )}
                <p className="text-sm text-muted leading-relaxed">{author.shortBio}</p>
              </div>
            </div>
          </footer>
        )}

      </article>
    </div>
  )
}