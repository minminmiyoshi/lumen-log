import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlugAndZone, getPostSlugsByZone, getPostsByZone } from "@/lib/mdx";
import { MdxRenderer } from "@/app/components/mdx/MdxRenderer";
import ShareButtons from "@/components/ShareButtons";
import RelatedPosts from "@/components/RelatedPosts";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import { ScrollToTop } from "@/components/ArticleUtils";
import Link from "next/link";

export async function generateStaticParams() {
  return getPostSlugsByZone("money");
}

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlugAndZone(slug, "money");
  if (!post) return {};

  const url = `https://lumen-log.com/money/blog/${slug}`;
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description ?? "",
      type: "article",
      url,
      publishedTime: post.date,
      tags: post.tags,
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function MoneyPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlugAndZone(slug, "money");
  if (!post) notFound();

  const url = `https://lumen-log.com/money/blog/${slug}`;
  const zonePosts = getPostsByZone("money");

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <ArticleJsonLd post={post} url={url} />

      <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "8px", fontFamily: "sans-serif" }}>
        {post.date} · {post.readingTime}
      </p>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "12px", lineHeight: 1.4 }}>
        {post.title}
      </h1>
      <div style={{ display: "flex", gap: "8px", marginBottom: "48px", flexWrap: "wrap" }}>
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "sans-serif", textDecoration: "none" }}
          >
            #{tag}
          </Link>
        ))}
      </div>
      <article style={{ lineHeight: 1.9, fontSize: "1rem" }}>
        <MdxRenderer html={post.html ?? ""} components={post.components ?? []} toc={post.toc ?? []} />
      </article>

      <RelatedPosts current={post} candidates={zonePosts} />

      <ShareButtons title={post.title} url={url} />

      <div style={{ marginTop: "40px" }}>
        <Link href="/money" style={{ fontSize: "0.875rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
          ← Money 一覧へ
        </Link>
      </div>

      <ScrollToTop />
    </main>
  );
}
