import { notFound } from "next/navigation";
import { getPostBySlugAndZone, getPostSlugsByZone } from "@/lib/mdx";
import { MdxRenderer } from "@/app/components/mdx/MdxRenderer";
import Link from "next/link";

export async function generateStaticParams() {
  return getPostSlugsByZone("money");
}

export const dynamic = "force-static";

export default async function MoneyPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlugAndZone(slug, "money");
  if (!post) notFound();

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "8px", fontFamily: "sans-serif" }}>
        {post.date} · {post.readingTime}
      </p>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "12px", lineHeight: 1.4 }}>
        {post.title}
      </h1>
      <div style={{ display: "flex", gap: "8px", marginBottom: "48px" }}>
        {post.tags.map((tag) => (
          <span key={tag} style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
            #{tag}
          </span>
        ))}
      </div>
      <article style={{ lineHeight: 1.9, fontSize: "1rem" }}>
        <MdxRenderer html={post.html ?? ""} components={post.components ?? []} toc={post.toc ?? []} />
      </article>
      <div style={{ marginTop: "64px" }}>
        <Link href="/money" style={{ fontSize: "0.875rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
          ← Money 一覧へ
        </Link>
      </div>
    </main>
  );
}
