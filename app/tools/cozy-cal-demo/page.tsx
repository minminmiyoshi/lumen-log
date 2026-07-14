import type { Metadata } from "next";
import CozyCalDemo from "./CozyCalDemo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cozy Cal 体験デモ — シフト勤務者のためのカレンダー入力 | lumen-log",
  description:
    "プリセットを選んで日をタップし、まとめて登録。夜勤は入り→翌朝の明けで2日にまたがる帯として入る。シフト勤務者向けカレンダー Cozy Cal の入力の核を試せる体験版。サインアップ不要。",
  openGraph: {
    title: "Cozy Cal 体験デモ — シフト勤務者のためのカレンダー入力",
    description:
      "プリセット→日をタップ→まとめて登録。夜勤は入り→明けの2日帯。Cozy Cal の入力の核を体験。",
    url: "https://lumen-log.com/tools/cozy-cal-demo",
    siteName: "lumen-log",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cozy Cal 体験デモ — シフト勤務者のためのカレンダー入力",
    description: "プリセット→日をタップ→まとめて登録。夜勤は入り→明けの2日帯。",
  },
};

export default function Page() {
  return <CozyCalDemo />;
}
