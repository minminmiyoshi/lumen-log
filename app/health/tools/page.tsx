import Link from "next/link";

export const dynamic = "force-static";

const tools = [
  {
    slug: "shift-damage-score",
    title: "夜勤ダメージスコアラー",
    description: "6つの質問で夜勤負荷をスコア化。交代勤務の疫学データに基づく診断。",
    status: "live",
  },
  {
    slug: "routine-checker",
    title: "夜勤ルーティン最適化診断",
    description: "夜勤前後の生活パターンを入力し、睡眠医学に基づく改善提案を受け取る。",
    status: "coming",
  },
  {
    slug: "shift-cost-calculator",
    title: "夜勤シフト×生活コスト計算機",
    description: "夜勤手当・食費増・体調コストを入力し、1回あたりの実質時給を可視化。",
    status: "coming",
  },
  {
    slug: "risk-timer",
    title: "交代勤務リスクタイマー",
    description: "夜勤歴と頻度から、心血管・代謝系の相対リスクをエビデンスベースで表示。",
    status: "coming",
  },
];

export default function ToolsPage() {
  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Tools</h1>
      <p style={{
        color: "var(--muted)",
        fontSize: "0.8rem",
        fontFamily: "sans-serif",
        marginBottom: "48px",
        lineHeight: "1.6",
      }}>
        夜勤従事者のためのセルフチェックツール。ウェアラブル不要、選択式で完結。
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tools.map((tool) => {
          const isLive = tool.status === "live";
          const inner = (
            <div style={{
              padding: "20px 0",
              borderBottom: "1px solid #E8E4DF",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <p style={{
                  fontSize: "1.1rem",
                  fontFamily: "Palatino, serif",
                  margin: 0,
                  color: isLive ? "var(--foreground)" : "var(--muted)",
                }}>
                  {tool.title}
                </p>
                {!isLive && (
                  <span style={{
                    fontSize: "0.65rem",
                    fontFamily: "sans-serif",
                    color: "var(--muted)",
                    border: "1px solid #E8E4DF",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                  }}>
                    coming soon
                  </span>
                )}
              </div>
              <p style={{
                fontSize: "0.8rem",
                fontFamily: "sans-serif",
                color: "var(--muted)",
                margin: 0,
                lineHeight: "1.6",
              }}>
                {tool.description}
              </p>
            </div>
          );

          return (
            <li key={tool.slug}>
              {isLive ? (
                <Link href={`/health/tools/${tool.slug}`} style={{ color: "var(--foreground)" }}>
                  {inner}
                </Link>
              ) : (
                <div style={{ opacity: 0.6 }}>
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
