import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStoryBySlugAndZone, getStorySlugsByZone } from "@/lib/mdx";
import { MdxRenderer } from "@/app/components/mdx/MdxRenderer";
import Link from "next/link";

export async function generateStaticParams() {
  return getStorySlugsByZone("health");
}

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlugAndZone(slug, "health");
  if (!story) return {};

  const url = `https://lumen-log.com/health/stories/${slug}`;
  return {
    title: story.title,
    description: story.description,
    openGraph: {
      title: story.title,
      description: story.description ?? "",
      type: "article",
      url,
      publishedTime: story.date,
      tags: story.tags,
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: story.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.description,
    },
    alternates: { canonical: url },
  };
}

export default async function HealthStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getStoryBySlugAndZone(slug, "health");
  if (!story) notFound();

  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 24px" }}>
      <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "8px", fontFamily: "sans-serif" }}>
        {story.episode != null ? `Episode ${story.episode}` : null}
        {story.mainTheme ? ` · ${story.mainTheme}` : ""}
      </p>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "12px", lineHeight: 1.4, fontFamily: "'Shippori Mincho B1', serif" }}>
        {story.title}
      </h1>
      <div style={{ display: "flex", gap: "8px", marginBottom: "48px" }}>
        {story.tags.map((tag) => (
          <span key={tag} style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
            #{tag}
          </span>
        ))}
      </div>
      <article
        className="story-body"
        style={{ lineHeight: 2.0, fontSize: "1.05rem", fontFamily: "'Shippori Mincho B1', serif" }}
      >
        {/* 小説では TOC を出さない（toc を空で渡す） */}
        <MdxRenderer html={story.html ?? ""} components={story.components ?? []} toc={[]} />
      </article>
      <div style={{ marginTop: "64px" }}>
        <Link href="/health/stories" style={{ fontSize: "0.875rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
          ← 連載小説「Lumen」一覧へ
        </Link>
      </div>
    </main>
  );
}
