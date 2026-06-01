import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const postsDir = path.join(__dirname, '../posts')
const outputPath = path.join(__dirname, '../data/posts.json')

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'))

const posts = await Promise.all(files.map(async f => {
  const slug = f.replace(/\.mdx$/, '')
  const raw = fs.readFileSync(path.join(postsDir, f), 'utf-8')
  
  // frontmatterを除去してHTMLに変換
  const withoutFrontmatter = raw.replace(/^---[\s\S]*?---\n/, '')
  const result = await remark().use(remarkHtml).process(withoutFrontmatter)
  const html = result.toString()
  
  return { slug, raw, html }
}))

fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2))
console.log(`Built ${posts.length} posts → data/posts.json`)