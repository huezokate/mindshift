import fs from 'fs'
import path from 'path'
import { marked } from 'marked'

// File-based dev-log posts: content/blog/YYYY-MM-DD-slug.md with a small YAML
// frontmatter block (title / description / date). Server-only — imported from
// server components; the fs calls make this module unusable on the client.

export type BlogPost = {
  slug: string
  title: string
  description: string
  date: string // ISO yyyy-mm-dd
  cover?: string // public path to the index-card image
  coverAlt?: string
  html: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

// Minimal frontmatter parse — flat `key: value` lines between --- fences.
// Deliberately not YAML-complete: posts only carry three scalar fields.
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { meta: {}, body: raw }
  const meta: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { meta, body: raw.slice(match[0].length) }
}

function loadPost(filename: string): BlogPost {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
  const { meta, body } = parseFrontmatter(raw)
  // Slug = filename minus the date prefix and extension, so URLs stay stable
  // even if the file is renamed to a new date.
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
  const date = meta.date ?? filename.slice(0, 10)
  return {
    slug,
    title: meta.title ?? slug,
    description: meta.description ?? '',
    date,
    cover: meta.cover,
    coverAlt: meta.coverAlt,
    html: marked.parse(body, { async: false }),
  }
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(loadPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find(p => p.slug === slug)
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
