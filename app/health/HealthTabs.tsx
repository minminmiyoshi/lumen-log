import Link from "next/link";

// /health 配下の「記事 / 物語」切り替えタブ。
// active には "articles" か "stories" を渡す。
export function HealthTabs({ active }: { active: "articles" | "stories" }) {
  // note 未公開のあいだは本番で「物語」タブを隠す（dev では表示）。
  // note 公開時にこの分岐を外す（運用手順書 初回公開時を参照）。
  const allTabs = [
    { key: "articles", label: "記事", href: "/health" },
    { key: "stories", label: "物語", href: "/health/stories" },
  ] as const;
  const tabs =
    process.env.NODE_ENV === "production"
      ? allTabs.filter((t) => t.key !== "stories")
      : allTabs;

  // タブが1つだけなら表示しない（記事のみのとき）
  if (tabs.length <= 1) return null;

  return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "40px", borderBottom: "1px solid #E8E4DF" }}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            style={{
              fontSize: "0.9rem",
              fontFamily: "sans-serif",
              padding: "10px 18px",
              color: isActive ? "var(--foreground)" : "var(--muted)",
              fontWeight: isActive ? 600 : 400,
              borderBottom: isActive ? "2px solid #8B3A2C" : "2px solid transparent",
              marginBottom: "-1px",
              textDecoration: "none",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
