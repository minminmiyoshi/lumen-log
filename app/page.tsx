import HeroChaos from "@/components/HeroChaos";
import nowData from "@/data/now.json";
import { getTranslations } from "next-intl/server";

interface NavItem { href: string; label: string; badge?: string; descKey: string; }

const navItems: NavItem[] = [
  { href: "/health", label: "Health", descKey: "healthDesc" },
  { href: "/money",  label: "Money",  descKey: "moneyDesc" },
  { href: "/about",  label: "About",  descKey: "aboutDesc" },
];

function deltaStr(d: number | null, unit = "") {
  if (d === null) return "";
  const sign = d > 0 ? "+" : "";
  return `${sign}${d}${unit}`;
}

function deltaUp(key: "restingHr" | "sleep" | "weight") {
  const d = nowData[key].delta;
  if (d === null) return true;
  if (key === "restingHr") return d <= 0;
  return d >= 0;
}

export default async function Home() {
  const t = await getTranslations("home");

  const stats = [
    {
      labelKey: "restingHr",
      value: nowData.restingHr.value ?? "--",
      unit: "bpm",
      delta: deltaStr(nowData.restingHr.delta),
      up: deltaUp("restingHr"),
    },
    {
      labelKey: "sleep",
      value: nowData.sleep.value ?? "--",
      unit: "h",
      delta: deltaStr(nowData.sleep.delta, "h"),
      up: deltaUp("sleep"),
    },
    {
      labelKey: "weight",
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
            {t("tagline")}
          </p>
          <h1 style={{ fontFamily: "Palatino, serif", fontSize: "clamp(1.6rem, 4vw, 2.3rem)", fontWeight: 700, lineHeight: 1.45, marginBottom: "20px", color: "var(--foreground)", whiteSpace: "pre-line" }}>
            {t("hero")}
          </h1>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.85, maxWidth: "420px" }}>
            {t("heroSub")}
          </p>
        </div>
      </section>

      <section style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1D9E75", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>{t("now")}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginBottom: "48px" }}>
          {stats.map((s) => (
            <div key={s.labelKey} style={{ background: "var(--surface)", border: "0.5px solid #E8E4DF", borderRadius: "8px", padding: "14px 16px 12px" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", letterSpacing: "0.05em", marginBottom: "6px" }}>{t(`stats.${s.labelKey}`)}</div>
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
        {navItems.map(({ href, label, badge, descKey }) => (
          <a key={href} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", borderBottom: "1px solid #E8E4DF", color: "inherit", textDecoration: "none" }}>
            <div>
              <div style={{ fontFamily: "Palatino, serif", fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                {label}
                {badge && <span style={{ fontSize: "0.65rem", padding: "2px 7px", borderRadius: "99px", border: "0.5px solid #E8E4DF", color: "var(--muted)" }}>{badge}</span>}
              </div>
              <div style={{ fontFamily: "sans-serif", fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>{t(`nav.${descKey}`)}</div>
            </div>
            <span style={{ color: "var(--muted)", fontSize: "1rem", marginLeft: "16px" }}>→</span>
          </a>
        ))}
      </section>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </main>
  );
}
