"use client";

// app/search/page.tsx
// search-index.json を fetch して Fuse.js でインクリメンタル検索。
// サーバー不要・Cloudflare Pages 静的配信で動く。

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";

interface IndexItem {
  slug: string;
  zone: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  readingTime: string;
}

export default function SearchPage() {
  const [index, setIndex] = useState<IndexItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((data: IndexItem[]) => {
        setIndex(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: [
          { name: "title", weight: 3 },
          { name: "tags", weight: 2 },
          { name: "description", weight: 1 },
        ],
        threshold: 0.4, // 0=厳密, 1=緩い
        ignoreLocation: true,
      }),
    [index]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse]);

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "24px", fontFamily: "Palatino, serif" }}>
        Search
      </h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="キーワードで記事を探す"
        autoFocus
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: "1rem",
          fontFamily: "sans-serif",
          border: "1px solid #D8D2C5",
          borderRadius: "8px",
          background: "var(--background)",
          color: "var(--foreground)",
          outline: "none",
          marginBottom: "32px",
        }}
      />

      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", fontFamily: "sans-serif" }}>
          読み込み中…
        </p>
      ) : query.trim() === "" ? (
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", fontFamily: "sans-serif" }}>
          タイトル・タグ・概要から検索します。
        </p>
      ) : results.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", fontFamily: "sans-serif" }}>
          「{query}」に一致する記事は見つかりませんでした。
        </p>
      ) : (
        <>
          <p style={{ color: "var(--muted)", fontSize: "0.8rem", fontFamily: "sans-serif", marginBottom: "24px" }}>
            {results.length}件
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {results.map((post) => (
              <li key={`${post.zone}-${post.slug}`} style={{ borderBottom: "1px solid #E8E4DF", padding: "20px 0" }}>
                <Link href={`/${post.zone}/blog/${post.slug}`} style={{ color: "var(--foreground)" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "4px", fontFamily: "sans-serif" }}>
                    {post.date} · {post.readingTime} · {post.zone}
                  </p>
                  <p style={{ fontSize: "1.05rem", fontFamily: "Palatino, serif", marginBottom: "6px", lineHeight: 1.5 }}>
                    {post.title}
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {post.tags.map((t) => (
                      <span key={t} style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
