export default function Home() {
  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px 120px" }}>

      <section style={{ marginBottom: "64px" }}>
        <p style={{
          fontSize: "0.7rem",
          fontFamily: "sans-serif",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "16px",
        }}>
          Lumen Log
        </p>
        <h1 style={{
          fontFamily: "Palatino, serif",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          fontWeight: 700,
          lineHeight: 1.4,
          marginBottom: "20px",
          color: "var(--foreground)",
        }}>
          悶々とする救急医の、<br />
          投資と資産と身体の記録。
        </h1>
        <p style={{
          fontFamily: "sans-serif",
          fontSize: "0.9rem",
          color: "var(--muted)",
          lineHeight: 1.8,
          maxWidth: "480px",
        }}>
          夜勤医師がFIREを目指して資産・身体・時間を最適化していく一次記録。
          ツールで自分のデータを可視化し、ブログで思考を残す。
        </p>
      </section>

      <section style={{ borderTop: "1px solid #E8E4DF" }}>
        {[
          { href: "/blog", label: "Blog", desc: "投資・FIRE・医療・古民家。思考の記録。" },
          { href: "/tools", label: "Tools", desc: "健康ダッシュボード・資産シミュレーター・当直記録。" },
          { href: "/about", label: "About", desc: "このサイトと運営者について。" },
        ].map(({ href, label, desc }) => (
          <a
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 0",
              borderBottom: "1px solid #E8E4DF",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <div>
              <div style={{
                fontFamily: "Palatino, serif",
                fontSize: "1.05rem",
                fontWeight: 700,
                marginBottom: "4px",
              }}>
                {label}
              </div>
              <div style={{
                fontFamily: "sans-serif",
                fontSize: "0.8rem",
                color: "var(--muted)",
                lineHeight: 1.6,
              }}>
                {desc}
              </div>
            </div>
            <span style={{ color: "var(--muted)", fontSize: "1rem", marginLeft: "16px" }}>→</span>
          </a>
        ))}
      </section>

    </main>
  );
}
