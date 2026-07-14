import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "道具 — 夜勤者のためのアプリとツール | lumen-log",
  description:
    "夜勤・交代勤務の負荷を軽くするために自作したアプリとツール。夜勤対応カレンダー Cozy Cal、健康ダッシュボード NOCT、料理アシスタント Cozy Kitchen、セルフチェックツール群。",
};

type App = {
  id: string;
  name: string;
  tag: string;
  desc: string;
  appUrl: string;
  demoHref?: string; // 体験デモ（サイト内）
};

const apps: App[] = [
  {
    id: "app · 01",
    name: "Cozy Cal",
    tag: "夜勤シフトカレンダー",
    desc: "夜勤を入り→明けの帯で一目に。プリセットで複数日まとめて登録、Googleカレンダー双方向連携、持ち主色で夫婦の予定を分担。",
    appUrl: "https://cal.lumen-log.com",
    demoHref: "/tools/cozy-cal-demo",
  },
  {
    id: "app · 02",
    name: "NOCT",
    tag: "夜勤 × 健康ダッシュボード",
    desc: "睡眠・自律神経・回復を夜勤サイクルに重ねて可視化。このサイトの n=1 実証データを支えるエンジン。",
    appUrl: "https://noct.lumen-log.com",
  },
  {
    id: "app · 03",
    name: "Cozy Kitchen",
    tag: "料理アシスタント",
    desc: "夜勤明けでも回る作り置き・時短の献立づくり。冷蔵庫の写真から提案。Cozy Cal の夜勤日と連携。",
    appUrl: "https://kitchen.lumen-log.com",
  },
];

type Tool = {
  slug: string;
  title: string;
  desc: string;
  status: "live" | "coming";
};

const tools: Tool[] = [
  {
    slug: "/health/tools/shift-damage-score",
    title: "夜勤ダメージスコアラー",
    desc: "6つの質問で夜勤負荷をスコア化。交代勤務の疫学データに基づく診断。",
    status: "live",
  },
  {
    slug: "/health/tools",
    title: "夜勤ルーティン最適化診断 ほか",
    desc: "睡眠医学に基づく生活パターン診断・リスクタイマーなどを順次公開。",
    status: "coming",
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-washi text-sumi">
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-10 md:py-14">
        {/* header */}
        <div className="flex justify-between font-mono text-[11px] text-mist tracking-wide">
          <span>tools &amp; apps</span>
          <span>self-built</span>
        </div>
        <h1 className="font-serif text-[36px] md:text-[52px] leading-[1.1] font-normal mt-8 m-0">
          道具 <span className="font-mincho text-base text-mist ml-2">— instruments</span>
        </h1>
        <p className="font-mincho text-[15px] md:text-base text-sumi-soft mt-4 leading-[1.9] max-w-[560px]">
          夜勤という働き方の負荷を、少しでも軽くするために自分で作って、自分で使っているアプリとツール。
          夜勤の科学を、机上でなく“動くもの”で確かめている。
        </p>

        {/* Apps */}
        <section className="mt-12">
          <div className="flex justify-between items-baseline pb-3 border-b border-sumi">
            <h2 className="font-serif text-2xl font-normal m-0">Apps</h2>
            <span className="font-mono text-[11px] text-mist">lumen-log アカウント共通</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {apps.map((a) => (
              <div
                key={a.id}
                className="flex flex-col p-5 border border-hairline rounded bg-washi-deep/40"
              >
                <div className="font-mono text-[10.5px] text-bengara mb-3">{a.id}</div>
                <div className="font-serif text-[19px] leading-tight">{a.name}</div>
                <div className="font-mono text-[10.5px] text-mist mt-1">{a.tag}</div>
                <p className="font-mincho text-[13px] text-sumi-soft leading-relaxed mt-3 mb-5 flex-1">
                  {a.desc}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {a.demoHref ? (
                    <Link
                      href={a.demoHref}
                      className="font-mono text-[11px] text-sumi hover:text-bengara transition-colors underline underline-offset-4"
                    >
                      体験デモ
                    </Link>
                  ) : (
                    <span className="font-mono text-[11px] text-mist">体験デモ soon</span>
                  )}
                  <a
                    href={a.appUrl}
                    className="font-mono text-[11px] text-bengara hover:text-sumi transition-colors"
                  >
                    アプリを開く →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Self-tools */}
        <section className="mt-12">
          <div className="flex justify-between items-baseline pb-3 border-b border-sumi">
            <h2 className="font-serif text-2xl font-normal m-0">Self-check tools</h2>
            <span className="font-mono text-[11px] text-mist">アカウント不要</span>
          </div>

          <div className="mt-4">
            {tools.map((t, i) => {
              const inner = (
                <div
                  className={`flex items-baseline gap-3 md:gap-4 py-4 px-2 -mx-2 ${
                    i < tools.length - 1 ? "border-b border-hairline" : ""
                  } ${t.status === "live" ? "hover:bg-washi-deep transition-colors" : ""}`}
                >
                  <span className="font-mincho text-[15px] md:text-[16px] flex-1 leading-snug">
                    {t.title}
                    <span className="block font-mincho text-[12px] text-mist mt-1 leading-relaxed">
                      {t.desc}
                    </span>
                  </span>
                  <span className="font-mono text-[10.5px] text-mist shrink-0">
                    {t.status === "live" ? "live" : "soon"}
                  </span>
                </div>
              );
              return t.status === "live" ? (
                <Link key={t.slug} href={t.slug} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={t.slug} className="opacity-70">
                  {inner}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-16 flex justify-between items-baseline">
          <Link
            href="/"
            className="font-mono text-[11px] text-sumi hover:text-bengara transition-colors"
          >
            ← home
          </Link>
          <span className="font-mincho text-xs text-mist">
            © 2025 — ゆるく、しずかに、続ける記録
          </span>
        </footer>
      </div>
    </main>
  );
}
