import HeroChaos from "@/components/HeroChaos";
import nowData from "@/data/now.json";

interface NavItem { href: string; label: string; badge?: string; desc: string; }

const navItems: NavItem[] = [
  { href: "/blog",  label: "Blog",  badge: "12", desc: "投資・FIRE・医療・古民家。思考の記録。" },
  { href: "/tools", label: "Tools", badge: "3",  desc: "健康ダッシュボード・資産シミュレーター・当直記録。" },
  { href: "/about", label: "About",              desc: "このサイトと運営者について。" },
];

function deltaStr(d: number | null, unit = "") {
  if (d === null) return "";
  const sign = d > 0 ? "+" : "";
  return `${sign}${d}${unit}`;
}

function deltaUp(key: "restingHr" | "sleep" | "weight") {
  const d = nowData[key].delta;
  if (d === null) return true;
  // 心拍は下がる方が良い、睡眠・体重は文脈依存だが一旦シンプルに
  if (key === "restingHr") return d <= 0;
  return d >= 0;
}

export default function Home() {
  const stats = [
    {
      label: "安静時心拍",
      value: nowData.restingHr.value ?? "--",
      unit: "bpm",
      delta: deltaStr(nowData.restingHr.delta),
      up: deltaUp("restingHr"),
    },
    {
      label: "睡眠時間",
      value: nowData.sleep.value ?? "--",
      unit: "h",
      delta: deltaStr(nowData.sleep.delta, "h"),
      up: deltaUp("sleep"),
    },
    {
      label: "体重",
      value: nowData.weight.value ?? "--",
      unit: "kg",
      delta: deltaStr(nowData.weight.delta, "kg"),
      up: deltaUp("weight"),
    },
  ];

  return (
    <main>
      <section style={{ position: "relative", height: "clamp(420px, 55vw, 540px)", overflow: "hidden" }}>
        <HeroChaos />
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
          <p style={{ fontSize: "0.7rem", fontFamily: "sans-serif", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>
            Lumen Log
          </p>
          <h1 style={{ fontFamily: "Palatino, serif", fontSize: "clamp(1.6rem, 4vw, 2.3rem)", fontWeight: 700, lineHeight: 1.45, marginBottom: "20px", color: "var(--foreground)" }}>
            悶々とする救急医の、<br />
            投資と資産と身体の記録。
          </h1>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.85, maxWidth: "420px" }}>
            夜勤医師がFIREを目指して資産・身体・時間を最適化していく一次記録。ツールで自分のデータを可視化し、ブログで思考を残す。
          </p>
        </div>
      </section>

      <section style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1D9E75", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>Now</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginBottom: "48px" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "var(--surface)", border: "0.5px solid #E8E4DF", borderRadius: "8px", padding: "14px 16px 12px" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", letterSpacing: "0.05em", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Mono', 'Courier New', monospace", fontSize: "1.35rem", fontWeight: 400, color: "var(--foreground)", lineHeight: 1, marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", display: "flex", gap: "6px" }}>
                <span>{s.unit}</span>
                <span style={{ color: s.up ? "#1D9E75" : "#D85A30" }}>{s.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px 120px", borderTop: "1px solid #E8E4DF" }}>
        {navItems.map(({ href, label, badge, desc }) => (
          <a key={href} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", borderBottom: "1px solid #E8E4DF", color: "inherit", textDecoration: "none" }}>
            <div>
              <div style={{ fontFamily: "Palatino, serif", fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                {label}
                {badge && <span style={{ fontSize: "0.65rem", padding: "2px 7px", borderRadius: "99px", border: "0.5px solid #E8E4DF", color: "var(--muted)" }}>{badge}</span>}
              </div>
              <div style={{ fontFamily: "sans-serif", fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>{desc}</div>
            </div>
            <span style={{ color: "var(--muted)", fontSize: "1rem", marginLeft: "16px" }}>→</span>
          </a>
        ))}
      </section>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </main>
  );
}
