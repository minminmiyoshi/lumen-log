// app/search-index.json/route.ts
// Fuse.js 用の軽量検索インデックスを返す。本文は含めず、メタ情報のみ。
// クライアント側で fetch して Fuse でインクリメンタル検索する。

import { NextResponse } from "next/server";
import { getAllPostsMeta } from "@/lib/mdx";

export const dynamic = "force-static";

export async function GET() {
  const index = getAllPostsMeta()
    .filter((p) => p.type !== "story")
    .map((p) => ({
      slug: p.slug,
      zone: p.zone,
      title: p.title,
      description: p.description ?? "",
      tags: p.tags,
      date: p.date,
      readingTime: p.readingTime,
    }));

  return NextResponse.json(index, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
