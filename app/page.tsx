export default function Home() {
  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "80px 24px" }}>

      <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Lumen Log</h1>

      <p style={{ color: "var(--muted)", marginBottom: "48px", fontFamily: "sans-serif" }}>
        悶々とする救急医の、投資と資産と身体の記録
      </p>

      <nav style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <a href="/blog" style={{ color: "var(--indigo)", fontFamily: "sans-serif" }}>
          → ブログ
        </a>
        <a href="/tools" style={{ color: "var(--indigo)", fontFamily: "sans-serif" }}>
          → ツール
        </a>
        <a href="/about" style={{ color: "var(--indigo)", fontFamily: "sans-serif" }}>
          → このサイトについて
        </a>
      </nav>

    </main>
  );
}