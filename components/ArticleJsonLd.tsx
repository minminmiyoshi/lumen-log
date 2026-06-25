// components/ArticleJsonLd.tsx
// 記事ページの <head> に Article 構造化データを埋め込む。
// 検索結果のリッチスニペット対応。サーバーコンポーネント。

import type { PostMeta } from "@/types/post";

interface ArticleJsonLdProps {
  post: PostMeta;
  url: string;
}

export default function ArticleJsonLd({ post, url }: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description ?? "",
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: {
      "@type": "Person",
      name: "ゆるゆる救急医",
      url: "https://lumen-log.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "lumen-log",
      url: "https://lumen-log.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: post.tags.join(", "),
    image: post.ogImage ?? "https://lumen-log.com/og-default.png",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
