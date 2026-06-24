import Link from "next/link";
import { getStoriesByZone } from "@/lib/mdx";

export const dynamic = "force-static";

export default function HealthStoriesPage() {
  const stories = getStoriesByZone("health");

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px", fontFamily: "'Shippori Mincho B1', serif" }}>
        連載小説「Lumen」
      </h1>
      <p style={{
        color: "var(--muted)",
        fontSize: "0.8rem",
        fontFamily: "sans-serif",
        marginBottom: "48px",
        lineHeight: "1.6",
      }}>
        夜勤を支える人たちの物語
      </p>

      {/* Health 一覧へ戻る導線 */}
      <div style={{ marginBottom: "48px" }}>
        <Link href="/health" style={{
          fontSize: "0.8rem",
          fontFamily: "sans-serif",
          color: "var(--indigo)",
          padding: "8px 16px",
          border: "1px solid #E8E4DF",
          borderRadius: "6px",
        }}>
          ← Health 一覧
        </Link>
      </div>

      {stories.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>エピソードはまだありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {stories.map((story) => (
            <li key={story.slug} style={{ borderBottom: "1px solid #E8E4DF", padding: "24px 0" }}>
              <Link href={`/health/stories/${story.slug}`} style={{ color: "var(--foreground)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "6px", fontFamily: "sans-serif" }}>
                  {story.episode != null ? `Episode ${story.episode}` : null}
                  {story.mainTheme ? ` · ${story.mainTheme}` : ""}
                  {story.chapterCount ? ` · 第${story.chapterCount}話まで公開中` : ""}
                </p>
                <p style={{ fontSize: "1.15rem", fontFamily: "'Shippori Mincho B1', serif", marginBottom: "8px", lineHeight: 1.5 }}>
                  {story.title}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {story.tags.map((tag) => (
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
