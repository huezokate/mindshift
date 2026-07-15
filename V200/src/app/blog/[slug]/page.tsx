import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts, getPost, formatPostDate } from '@/lib/blog'
import '../blog.css'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Minds Shift Mind Log`,
    description: post.description,
    alternates: { canonical: `https://minds-shift.com/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, type: 'article', publishedTime: post.date },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Person', name: 'Kate Huezo' },
    publisher: { '@type': 'Organization', name: 'Minds Shift', url: 'https://minds-shift.com' },
    mainEntityOfPage: `https://minds-shift.com/blog/${post.slug}`,
  }

  return (
    <div data-theme="notepad" className="notepad-paper min-h-dvh">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px var(--page-pad) 64px' }}>

        <header style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
          <p style={{ margin: 0 }}>
            <Link
              href="/blog"
              style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--link-color, var(--cyan))', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              ← Mind Log
            </Link>
          </p>
          <p
            className="uppercase"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: 1.4, color: 'var(--pink)', margin: 0 }}
          >
            {formatPostDate(post.date)}
          </p>
          <h1
            className="uppercase"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(30px, 5vw, 48px)', letterSpacing: 2.5, lineHeight: 1.1, color: 'var(--cyan)', margin: 0 }}
          >
            {post.title}
          </h1>
        </header>

        <div className="blog-prose" dangerouslySetInnerHTML={{ __html: post.html }} />

        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--input-divider)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, letterSpacing: 0.3, lineHeight: 1.6, color: 'var(--text-body)', margin: 0 }}>
            Want the next entry in your inbox?{' '}
            <Link
              href="/#waitlist"
              style={{ color: 'var(--link-color, var(--cyan))', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              Join the list →
            </Link>
          </p>
        </footer>

      </article>
    </div>
  )
}
