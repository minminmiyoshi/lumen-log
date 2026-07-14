import type { Metadata } from "next";
import NoctDemo from "./NoctDemo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "NOCT 体験デモ — 夜勤×健康ダッシュボードとAI解析 | lumen-log",
  description:
    "夜勤サイクルに睡眠・自律神経・回復を重ねて可視化し、AI解析レポート（機械確定のグレード＋根拠数値＋助言）まで出す健康ダッシュボード NOCT の体験版。表示はすべてデモ用の合成サンプル。",
  openGraph: {
    title: "NOCT 体験デモ — 夜勤×健康ダッシュボードとAI解析",
    description:
      "夜勤×睡眠・自律神経・回復の可視化と、AI解析レポート。デモ用サンプルデータで体験。",
    url: "https://lumen-log.com/tools/noct-demo",
    siteName: "lumen-log",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOCT 体験デモ — 夜勤×健康ダッシュボードとAI解析",
    description: "夜勤×健康の可視化とAI解析レポートを体験（合成サンプル）。",
  },
};

export default function Page() {
  return <NoctDemo />;
}
