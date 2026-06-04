import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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

const files = fs.readdirSync(postsDir).filter(f => /\.mdx?$/.test(f))

const posts = files.map(f => {
  const slug = f.replace(/\.mdx?$/, '')
  const raw = fs.readFileSync(path.join(postsDir, f), 'utf-8')
  const { frontmatter, content } = parseFrontmatter(raw)
  return { slug, content, ...frontmatter }
})

fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2))
console.log(`Built ${posts.length} posts -> data/posts.json`)
