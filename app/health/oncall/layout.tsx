import type { Metadata } from "next";

// page.tsx が "use client" のため metadata をここで定義する。
// 夜勤ログの入力用ページであり検索流入を想定していないので noindex にする。
export const metadata: Metadata = {
  title: "夜勤ログ入力",
  robots: { index: false, follow: false },
  alternates: { canonical: "/health/oncall" },
};

export default function OncallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
