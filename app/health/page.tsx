import Link from "next/link";
import { getPostsByZone } from "@/lib/mdx";
import { HealthTabs } from "./HealthTabs";

export const dynamic = "force-static";

export default function HealthPage() {
  const posts = getPostsByZone("health");

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Health</h1>
      <p style={{
        color: "var(--muted)",
        fontSize: "0.8rem",
        fontFamily: "sans-serif",
        marginBottom: "48px",
        lineHeight: "1.6",
      }}>
        夜勤・睡眠・ウェアラブル・パフォーマンス最適化
      </p>

      {/* ツールリンク */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "48px",
        flexWrap: "wrap",
      }}>
        <Link href="/health/dashboard" style={{
          fontSize: "0.8rem",
          fontFamily: "sans-serif",
          color: "var(--indigo)",
          padding: "8px 16px",
          border: "1px solid #E8E4DF",
          borderRadius: "6px",
        }}>
          Health Dashboard
        </Link>

        <Link href="/health/tools" style={{
          fontSize: "0.8rem",
          fontFamily: "sans-serif",
          color: "var(--indigo)",
          padding: "8px 16px",
          border: "1px solid #E8E4DF",
          borderRadius: "6px",
        }}>
          Tools
        </Link>
      </div>

      <HealthTabs active="articles" />

      {posts.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>記事はまだありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {posts.map((post) => (
            <li key={post.slug} style={{ borderBottom: "1px solid #E8E4DF", padding: "24px 0" }}>
              <Link href={`/health/blog/${post.slug}`} style={{ color: "var(--foreground)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "6px", fontFamily: "sans-serif" }}>
                  {post.date} · {post.readingTime}
                </p>
                <p style={{ fontSize: "1.1rem", fontFamily: "Palatino, serif", marginBottom: "8px" }}>
                  {post.title}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {post.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
