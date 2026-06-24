#!/usr/bin/env node
/**
 * note で1話公開したら、Obsidian の元ファイルから該当話を切り出して
 * stories/ の MDX に追記する。本文の転記は一切せず機械的にコピーする。
 *
 * 使い方:
 *   node scripts/append-episode-chapter.mjs <mdx名> <元ファイル名> [--final]
 * 例:
 *   node scripts/append-episode-chapter.mjs episode-1-nurse-sleep.mdx ep01_02_鏡の中の他人.md
 *   node scripts/append-episode-chapter.mjs episode-1-nurse-sleep.mdx ep01_10_灯.md --final
 *
 * --final: 最終話。追記後、末尾に StoryToArticle を付与する。
 */
import fs from 'fs'
import path from 'path'
import os from 'os'

const [, , mdxName, srcName, ...flags] = process.argv
const isFinal = flags.includes('--final')

if (!mdxName || !srcName) {
  console.error('Usage: node scripts/append-episode-chapter.mjs <mdx名> <元ファイル名> [--final]')
  process.exit(1)
}

const SRC_DIR = path.join(
  os.homedir(),
  'マイドライブ/takahiro/obsidian/30_projects/サイト運営/小説/ep01_山岸詩織'
)
const mdxPath = path.join(process.cwd(), 'stories', mdxName)
const srcPath = path.join(SRC_DIR, srcName)

if (!fs.existsSync(mdxPath)) { console.error(`MDXが見つからない: ${mdxPath}`); process.exit(1) }
if (!fs.existsSync(srcPath)) { console.error(`元ファイルが見つからない: ${srcPath}`); process.exit(1) }

// 元ファイルから該当話を抽出（H1 と note フッターを除去）
let chapter = fs.readFileSync(srcPath, 'utf-8')
chapter = chapter.replace(/^#\s*連載小説.*$/m, '')
chapter = chapter.replace(/\n>\s*🩺[\s\S]*$/, '\n')
chapter = chapter.trim().replace(/\n-{3,}\s*$/, '').trim()

// 既存MDXを読み、末尾の StoryToArticle があれば一旦外す
let mdx = fs.readFileSync(mdxPath, 'utf-8')
const slugMatch = mdx.match(/relatedArticles:\s*\[\s*"([^"]+)"/)
const relatedSlug = slugMatch ? slugMatch[1] : 'REPLACE_ME'
mdx = mdx.replace(/\n*<StoryToArticle[^>]*\/>\s*$/g, '').replace(/\s*$/, '')

// 話を追記
mdx += '\n\n' + chapter + '\n'

// 最終話なら StoryToArticle を付与
if (isFinal) {
  mdx = mdx.replace(/\s*$/, '') + `\n\n<StoryToArticle slug="${relatedSlug}" />\n`
}

fs.writeFileSync(mdxPath, mdx)

const chapterCount = (mdx.match(/^##\s*第.+?話/gm) || []).length
console.log(`OK: ${srcName} を ${mdxName} に追記`)
console.log(`現在の公開話数: 第${chapterCount}話まで`)
if (isFinal) console.log(`StoryToArticle（slug="${relatedSlug}"）を末尾に付与`)
console.log('\n次: node scripts/build-posts.mjs → ブラウザ確認 → commit/push')
