import type { Metadata } from "next";
import CozyCalDemo from "./CozyCalDemo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cozy Cal 体験デモ — 夜勤を塗るだけのカレンダー | lumen-log",
  description:
    "夜勤をタップで塗るだけで家の段取りが自動で立ち上がる、シフト勤務者のためのカレンダー Cozy Cal の体験版。サインアップ不要。",
  openGraph: {
    title: "Cozy Cal 体験デモ — 夜勤を塗るだけのカレンダー",
    description:
      "夜勤をネイティブに理解するカレンダー。タップで勤務を切り替えると段取りが自動で立ち上がる。",
    url: "https://lumen-log.com/tools/cozy-cal-demo",
    siteName: "lumen-log",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cozy Cal 体験デモ — 夜勤を塗るだけのカレンダー",
    description: "夜勤をタップで塗るだけ。段取りが自動で立ち上がる体験版。",
  },
};

export default function Page() {
  return <CozyCalDemo />;
}
