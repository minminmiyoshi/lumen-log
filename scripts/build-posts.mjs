import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const postsDir = path.join(__dirname, '../posts')
const outputPath = path.join(__dirname, '../data/posts.json')

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { frontmatter: {}, content: raw }
  const frontmatterStr = match[1]
  const content = match[2]
  const frontmatter = {}
  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    } else if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    } else if (value === 'true') {
      value = true
    } else if (value === 'false') {
      value = false
    }
    frontmatter[key] = value
  }
  return { frontmatter, content }
}

// Extract JSX component blocks (<NightShiftChart .../> and <Callout>...</Callout>)
// Replace them with placeholder divs, and collect their data.
function extractComponents(mdxContent) {
  const components = []
  let content = mdxContent
  let idx = 0

  // 1. Self-closing components like <NightShiftChart ... />
  content = content.replace(/<([A-Z][A-Za-z0-9]*)\b([^>]*?)\/>/g, (match, name, attrsRaw) => {
    const props = parseAttrs(attrsRaw)
    const id = `mdxc-${idx++}`
    components.push({ id, name, props, children: null })
    return `\n<div data-mdx-placeholder="${id}"></div>\n`
  })

  // 2. Block components like <Callout type="info">...</Callout>
  content = content.replace(/<([A-Z][A-Za-z0-9]*)\b([^>]*?)>([\s\S]*?)<\/\1>/g, (match, name, attrsRaw, inner) => {
    const props = parseAttrs(attrsRaw)
    const id = `mdxc-${idx++}`
    components.push({ id, name, props, children: inner.trim() })
    return `\n<div data-mdx-placeholder="${id}"></div>\n`
  })

  return { content, components }
}

// Parse attributes from a JSX tag. Handles attr="..." and attr={`...`} and attr={123}
function parseAttrs(attrsRaw) {
  const props = {}
  const re = /([a-zA-Z][a-zA-Z0-9]*)=(?:"([^"]*)"|\{`([\s\S]*?)`\}|\{([^}]*)\})/g
  let m
  while ((m = re.exec(attrsRaw)) !== null) {
    const key = m[1]
    if (m[2] !== undefined) {
      props[key] = m[2]
    } else if (m[3] !== undefined) {
      props[key] = m[3]
    } else if (m[4] !== undefined) {
      const v = m[4].trim()
      props[key] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v
    }
  }
  return props
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeHighlight)
  .use(rehypeStringify, { allowDangerousHtml: true })

const files = fs.readdirSync(postsDir).filter(f => /\.mdx?$/.test(f))

const posts = await Promise.all(files.map(async f => {
  const slug = f.replace(/\.mdx?$/, '')
  const raw = fs.readFileSync(path.join(postsDir, f), 'utf-8')
  const { frontmatter, content } = parseFrontmatter(raw)
  const { content: cleaned, components } = extractComponents(content)
  const html = String(await processor.process(cleaned))
  return { slug, content, html, components, ...frontmatter }
}))

fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2))
console.log(`Built ${posts.length} posts -> data/posts.json (with html + components)`)
