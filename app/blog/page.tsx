import Link from "next/link";

export const dynamic = "force-static"
import { getAllPostsMeta } from "@/lib/mdx";

export default function BlogPage() {
  const posts = getAllPostsMeta();

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "40px" }}>Blog</h1>

      {posts.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>記事はまだありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {posts.map((post) => (
            <li
              key={post.slug}
              style={{
                borderBottom: "1px solid #E8E4DF",
                padding: "24px 0",
              }}
            >
              <Link
                href={`/blog/${post.slug}`}
                style={{ color: "var(--foreground)" }}
              >
                <p style={{
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  marginBottom: "6px",
                  fontFamily: "sans-serif",
                }}>
                  {post.date} · {post.readingTime}
                </p>
                <p style={{
                  fontSize: "1.1rem",
                  fontFamily: "Palatino, serif",
                  marginBottom: "8px",
                }}>
                  {post.title}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--muted)",
                        fontFamily: "sans-serif",
                      }}
                    >
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