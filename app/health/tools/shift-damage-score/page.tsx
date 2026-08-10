import type { Metadata } from "next";
import ShiftDamageScorer from "./ShiftDamageScorer";

export const metadata: Metadata = {
  title: "夜勤ダメージスコアラー | lumen-log",
  description:
    "6つの質問であなたの夜勤負荷を可視化。交代勤務の疫学データに基づき、健康リスクと改善アドバイスを提示します。",
  openGraph: {
    title: "夜勤ダメージスコアラー",
    description:
      "あなたの夜勤はどれくらい身体に負荷をかけている？ 6つの質問でスコア化。",
    url: "https://lumen-log.com/health/tools/shift-damage-score",
    siteName: "lumen-log",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "夜勤ダメージスコアラー",
    description:
      "あなたの夜勤はどれくらい身体に負荷をかけている？ 6つの質問でスコア化。",
  },
  alternates: { canonical: "/health/tools/shift-damage-score" },
};

export default function Page() {
  return (
    <main>
      <ShiftDamageScorer />
    </main>
  );
}
