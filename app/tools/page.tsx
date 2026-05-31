// app/tools/page.tsx

import Link from "next/link";

type Tool = {
  title: string;
  description: string;
  href: string;
  status: "active" | "coming";
  tag: string;
};

const tools: Tool[] = [
  {
    title: "Portfolio",
    description: "米国株・日本株の保有銘柄をリアルタイム価格で管理。損益・評価額を円換算で表示。",
    href: "/tools/portfolio",
    status: "active",
    tag: "INVESTMENT",
  },
  {
    title: "Health Dashboard",
    description: "Garminデータ×当直記録を統合。睡眠・心拍・パフォーマンスの相関を可視化。",
    href: "/tools/health",
    status: "active",
    tag: "HEALTH",
  },
  {
    title: "Asset Simulator",
    description: "積立・取り崩しシナリオを複数比較。FIRE到達時期の逆算もできる資産シミュレーター。",
    href: "/tools/simulator",
    status: "coming",
    tag: "PLANNING",
  },
];

export default function ToolsPage() {
  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      {/* ヘッダー */}
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Tools</h1>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "0.8rem",
          fontFamily: "sans-serif",
          marginBottom: "48px",
          lineHeight: "1.6",
        }}
      >
        投資・健康・資産設計のための自作ツール群。一部は一般公開中。
      </p>

      {/* ツール一覧 */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tools.map((tool) => (
          <li
            key={tool.href}
            style={{
              borderBottom: "1px solid #E8E4DF",
              padding: "24px 0",
            }}
          >
            {tool.status === "active" ? (
              <Link href={tool.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <ToolCard tool={tool} />
              </Link>
            ) : (
              <div style={{ opacity: 0.5, cursor: "default" }}>
                <ToolCard tool={tool} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* フッター注記 */}
      <p
        style={{
          marginTop: "48px",
          fontSize: "0.75rem",
          color: "var(--muted)",
          fontFamily: "sans-serif",
        }}
      >
        * Coming Soon のツールは順次公開予定。
      </p>
    </main>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <>
      {/* タグ + ステータス */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "0.7rem",
            fontFamily: "sans-serif",
            color: "var(--muted)",
            letterSpacing: "0.1em",
          }}
        >
          {tool.tag}
        </span>
        {tool.status === "coming" && (
          <span
            style={{
              fontSize: "0.65rem",
              fontFamily: "sans-serif",
              padding: "2px 8px",
              backgroundColor: "#E8E4DF",
              borderRadius: "4px",
              color: "var(--muted)",
              letterSpacing: "0.05em",
            }}
          >
            COMING SOON
          </span>
        )}
      </div>

      {/* タイトル */}
      <p
        style={{
          fontFamily: "Palatino, serif",
          fontSize: "1.2rem",
          marginBottom: "6px",
        }}
      >
        {tool.title}
      </p>

      {/* 説明 */}
      <p
        style={{
          fontSize: "0.8rem",
          color: "var(--muted)",
          fontFamily: "sans-serif",
          lineHeight: "1.6",
        }}
      >
        {tool.description}
      </p>
    </>
  );
}