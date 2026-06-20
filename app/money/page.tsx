import Link from "next/link";
import { getPostsByZone } from "@/lib/mdx";

export const dynamic = "force-static";

export default function MoneyPage() {
  const posts = getPostsByZone("money");

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Money</h1>
      <p style={{
        color: "var(--muted)",
        fontSize: "0.8rem",
        fontFamily: "sans-serif",
        marginBottom: "48px",
        lineHeight: "1.6",
      }}>
        資産形成・投資判断・FIRE戦略・不動産
      </p>

      {/* ツールリンク */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "48px",
        flexWrap: "wrap",
      }}>
        <Link href="/money/portfolio" style={{
          fontSize: "0.8rem",
          fontFamily: "sans-serif",
          color: "var(--indigo)",
          padding: "8px 16px",
          border: "1px solid #E8E4DF",
          borderRadius: "6px",
        }}>
          Portfolio
        </Link>
        <Link href="/money/simulator" style={{
          fontSize: "0.8rem",
          fontFamily: "sans-serif",
          color: "var(--indigo)",
          padding: "8px 16px",
          border: "1px solid #E8E4DF",
          borderRadius: "6px",
        }}>
          Asset Simulator
        </Link>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>記事はまだありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {posts.map((post) => (
            <li key={post.slug} style={{ borderBottom: "1px solid #E8E4DF", padding: "24px 0" }}>
              <Link href={`/money/blog/${post.slug}`} style={{ color: "var(--foreground)" }}>
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
