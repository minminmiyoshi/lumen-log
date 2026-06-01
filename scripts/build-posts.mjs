import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const postsDir = path.join(__dirname, '../posts')
const outputPath = path.join(__dirname, '../data/posts.json')

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'))

const posts = files.map(f => {
  const slug = f.replace(/\.mdx$/, '')
  const raw = fs.readFileSync(path.join(postsDir, f), 'utf-8')
  return { slug, raw }
})

fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2))
console.log(`Built ${posts.length} posts → data/posts.json`)
