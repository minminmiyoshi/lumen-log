import type { Metadata } from "next";

// page.tsx が "use client" のため metadata をここで定義する。
// サイト内検索の結果ページは実質的に内容が空／重複になりやすく、
// Google から「ソフト404」「重複」と判定される典型パターンなので noindex にする。
export const metadata: Metadata = {
  title: "サイト内検索",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
