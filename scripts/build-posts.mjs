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

// Extract h2/h3 ids from processed HTML to ensure they match rehype-slug output.
// Returns a map of heading text -> id.
function extractIdsFromHtml(html) {
  const map = new Map()
  const re = /<h([23])\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g
  let m
  while ((m = re.exec(html)) !== null) {
    const id = m[2]
    const text = m[3].replace(/<[^>]+>/g, '').trim()
    map.set(text, id)
  }
  return map
}

// Extract h2/h3 headings from markdown content to build TOC.
// Must be called BEFORE component extraction so the heading text is intact.
function extractTocFromMarkdown(mdxContent) {
  const toc = []
  const lines = mdxContent.split('\n')
  let inCodeBlock = false
  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/)
    if (m) {
      const level = m[1].length
      const text = m[2].trim()
      toc.push({ level, text, id: '' })
    }
  }
  return toc
}

// Wrap the references section in collapsible <details>.
// Matches "## 参考文献" or "## References" and wraps everything that follows
// (including a leading horizontal rule) until end of content.
function wrapReferences(html) {
  // The references heading becomes <h2 id="参考文献">参考文献</h2> after processing
  const idx = html.search(/<h2[^>]*>(参考文献|References)<\/h2>/)
  if (idx === -1) return html
  const before = html.slice(0, idx)
  // Remove a trailing <hr> from the before-section (the --- divider before references)
  const beforeCleaned = before.replace(/<hr\s*\/?>(\s*)$/, '')
  const after = html.slice(idx)
  // Extract heading + body
  const headingMatch = after.match(/<h2[^>]*>(参考文献|References)<\/h2>/)
  if (!headingMatch) return html
  const headingEndIdx = headingMatch.index + headingMatch[0].length
  const headingHtml = after.slice(0, headingEndIdx)
  const bodyHtml = after.slice(headingEndIdx).trim()
  const headingText = headingMatch[1]
  // Count references (rough count of <li>)
  const refCount = (bodyHtml.match(/<li>/g) || []).length
  const summary = refCount > 0
    ? `${headingText}（${refCount}件）`
    : headingText
  const wrapped = `<details class="references-block"><summary>${summary}</summary><div class="references-body">${bodyHtml}</div></details>`
  return beforeCleaned + wrapped
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
  const toc = extractTocFromMarkdown(content)
  const { content: cleaned, components } = extractComponents(content)
  let html = String(await processor.process(cleaned))
  // Fill in TOC ids from the processed HTML (rehype-slug output)
  const idMap = extractIdsFromHtml(html)
  for (const item of toc) {
    item.id = idMap.get(item.text) || ''
  }
  // Filter out references heading from TOC since it'll be collapsed
  const tocFiltered = toc.filter(item => item.text !== '参考文献' && item.text !== 'References')
  html = wrapReferences(html)
  return { slug, content, html, components, toc: tocFiltered, ...frontmatter }
}))

fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2))
console.log(`Built ${posts.length} posts -> data/posts.json (with html + components + toc)`)
