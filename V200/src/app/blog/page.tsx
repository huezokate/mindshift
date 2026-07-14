import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, formatPostDate } from '@/lib/blog'
import './blog.css'

export const metadata: Metadata = {
  title: 'Mind Log — Minds Shift',
  description:
    'Building Minds Shift in public: what shipped, what broke, and why the app is built the way it is.',
  alternates: { canonical: 'https://minds-shift.com/blog' },
}

// The mind log lives on the marketing host, so it wears the landing's pinned
// notepad theme (scoped data-theme, same as src/app/page.tsx).
export default function BlogIndexPage() {
  const posts = getAllPosts()
  return (
    <div data-theme="notepad" className="notepad-paper min-h-dvh">
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px var(--page-pad) 64px' }}>

        <header style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center', marginBottom: 48 }}>
          <p
            className="uppercase"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: 1.4, lineHeight: '14px', color: 'var(--pink)' }}
          >
            Building in public
          </p>
          <h1
            className="uppercase"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(32px, 6vw, 56px)', letterSpacing: 3, color: 'var(--cyan)', lineHeight: 1 }}
          >
            Mind Log
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, letterSpacing: 0.4, lineHeight: 1.6, color: 'var(--text-body)' }}>
            What shipped, what broke, and why Minds Shift is built the way it is.
          </p>
          <p style={{ margin: 0 }}>
            <Link
              href="/"
              style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--link-color, var(--cyan))', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              ← Back to minds-shift.com
            </Link>
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              {/* Card = image left third, text preview right two thirds (Kate
                  2026-07-14); stacks vertically on phones. */}
              <article
                className="flex flex-col sm:flex-row transition-opacity hover:opacity-80 overflow-hidden"
                style={{
                  background: 'var(--card-bg)',
                  borderTop: 'var(--card-bt)',
                  borderLeft: 'var(--card-bl)',
                  borderRight: 'var(--card-br)',
                  borderBottom: 'var(--card-bb)',
                  borderRadius: 'var(--card-radius)',
                  boxShadow: 'var(--card-shadow)',
                  filter: 'var(--card-filter, none)',
                }}
              >
                {post.cover && (
                  <div className="sm:self-stretch" style={{ flex: '1 1 0', minWidth: 0, maxHeight: 340 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover}
                      alt={post.coverAlt ?? post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                    />
                  </div>
                )}
                <div style={{ flex: '2 1 0', minWidth: 0, padding: 28, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                  <p
                    className="uppercase"
                    style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1, color: 'var(--violet)', margin: 0 }}
                  >
                    {formatPostDate(post.date)}
                  </p>
                  <h2
                    className="uppercase"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, letterSpacing: 1.5, lineHeight: 1.2, color: 'var(--cyan)', margin: 0 }}
                  >
                    {post.title}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, letterSpacing: 0.3, lineHeight: 1.6, color: 'var(--text-body)', margin: 0 }}>
                    {post.description}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--link-color, var(--cyan))', textDecoration: 'underline', textUnderlineOffset: 3, margin: 0 }}>
                    Read the entry →
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
