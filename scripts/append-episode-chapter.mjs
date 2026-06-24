#!/usr/bin/env node
/**
 * note で1話公開したら、Obsidian の元ファイルから該当話を切り出して
 * stories/ の MDX に追記する。
 *
 * 使い方:
 *   node scripts/append-episode-chapter.mjs <mdx名> <元ファイル名> [--final]
 *
 * 動作:
 *   - 末尾に StoryToArticle があれば一旦外す（再実行時のため）
 *   - 本話を追記
 *   - <StoryTips episode={N} chapter={M} /> を追記
 *   - --final なら最後に <StoryToArticle /> を追記
 *
 * 注意:
 *   StoryTips の冪等性はない。同じ話を2回追記すると本文とStoryTipsが二重に入る。
 *   再生成したい場合は MDX を frontmatter のみにリセットしてから10話を順次追記する。
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

const chapterMatch = srcName.match(/^ep\d+_(\d+)_/)
if (!chapterMatch) {
  console.error(`元ファイル名から chapter 番号を抽出できない: ${srcName}`)
  process.exit(1)
}
const chapterNum = parseInt(chapterMatch[1], 10)

let chapter = fs.readFileSync(srcPath, 'utf-8')
chapter = chapter.replace(/^#\s*連載小説.*$/m, '')
chapter = chapter.replace(/\n>\s*🩺[\s\S]*$/, '\n')
chapter = chapter.trim().replace(/\n-{3,}\s*$/, '').trim()

let mdx = fs.readFileSync(mdxPath, 'utf-8')

const episodeMatch = mdx.match(/^episode:\s*(\d+)/m)
if (!episodeMatch) {
  console.error(`MDX の frontmatter から episode 番号を抽出できない`)
  process.exit(1)
}
const episodeNum = parseInt(episodeMatch[1], 10)

const slugMatch = mdx.match(/relatedArticles:\s*\[\s*"([^"]+)"/)
const relatedSlug = slugMatch ? slugMatch[1] : 'REPLACE_ME'

// 末尾の空白除去
mdx = mdx.replace(/\s*$/, '')

// 末尾の StoryToArticle のみ外す（StoryTips は外さない）
mdx = mdx.replace(/\s*<StoryToArticle[^>]*\/>\s*$/, '')

// 話を追記
mdx += '\n\n' + chapter + '\n'

// StoryTips を付与
mdx += `\n<StoryTips episode={${episodeNum}} chapter={${chapterNum}} />\n`

// 最終話なら StoryToArticle を付与
if (isFinal) {
  mdx += `\n<StoryToArticle slug="${relatedSlug}" />\n`
}

fs.writeFileSync(mdxPath, mdx)

const chapterCount = (mdx.match(/^##\s*第.+?話/gm) || []).length
const tipsCount = (mdx.match(/<StoryTips\s/g) || []).length
const articleCount = (mdx.match(/<StoryToArticle\s/g) || []).length

console.log(`OK: ${srcName} → episode=${episodeNum}, chapter=${chapterNum}`)
console.log(`  話数: ${chapterCount} / StoryTips: ${tipsCount} / StoryToArticle: ${articleCount}`)
