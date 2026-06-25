// app/feed.xml/route.ts
import { NextResponse } from "next/server";
import { getAllPostsMeta } from "@/lib/mdx";

const SITE_URL = "https://lumen-log.com";
const SITE_TITLE = "lumen-log | 夜勤医師×投資家×セルフ最適化マニア";
const SITE_DESCRIPTION =
  "夜勤医師が投資・資産形成・Garminデータ・FIRE戦略を一次情報として発信するサイト";
const AUTHOR = "ゆるゆる救急医";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPostsMeta()
    .filter((p) => p.type !== "story") // 小説はRSSから除外
    .slice(0, 20); // 最新20件

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/${post.zone}/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();
      const description = post.description ?? "";
      const tags = post.tags ?? [];

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${AUTHOR}</author>
      ${tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
