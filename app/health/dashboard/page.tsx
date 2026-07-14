import Link from "next/link";
import conditionRaw from "@/data/condition.json";

export const dynamic = "force-static";

// ── 侘び寂びパレット ──────────────────────────────
const ink = "#3a352e";      // 墨
const muted = "#8a8175";    // 霞
const cardBg = "#efeae1";   // 和紙（やや濃）
const line = "#dad3c6";     // 罫線
const border = `1px solid ${line}`;
const bengara = "#8b3a2c";  // 弁柄（アクセント）
const sage = "#6e7b5b";     // 良好
const ochre = "#b8893c";    // おおむね
const clay = "#b4552f";     // 注意
const deepred = "#9b3b2e";  // 要注意
const aiBlue = "#5b6b7b";   // 藍鼠（自律神経の線）

const bandColor = (lv: number) =>
  lv <= 0 ? sage : lv === 1 ? ochre : lv === 2 ? clay : deepred;
const alertColor = (lv: string) =>
  lv === "ok" ? sage : lv === "tired" ? ochre : lv === "warn" ? clay : deepred;

// ── 型 ──────────────────────────────
type CondStat = { value: number | null; unit?: string; label: string; sub?: string;
  delta_2w?: number | null; dev_pct?: number | null; trend_pct?: number | null;
  recent?: number | null; unrecovered?: number };
type CondBand = { key: string; title: string; en: string; level: number; label: string;
  note: string; readings: { k: string; v: string }[] };
type CondChart = { t: string; unit: string; zero: boolean; ref?: number; ref_label?: string;
  what: string; how: string; points: { x: string; y: number | null }[] };
type CondPanel = { title: string; en: string; level: number; label: string; desc: string; charts: CondChart[] };
type Condition = {
  generated?: string;
  overall: { line: string; alert_level: string; alert_text: string; alert_note: string | null };
  stats: { resting_hr: CondStat; hrv: CondStat; vo2max: CondStat; recovery: CondStat };
  bands: CondBand[];
  ai_insight: string | null;
  ai_date: string | null;
  panels: { ans: CondPanel; circadian: CondPanel };
};
const condition = conditionRaw as unknown as Condition;

// ── NOCT風の推移グラフ（SVG折れ線・面塗り・しきい値線・侘び寂び） ──────────
let chartUid = 0;
function TrendChart({ ch, color }: { ch: CondChart; color: string }) {
  const valid = ch.points.filter(p => p.y !== null) as { x: string; y: number }[];
  if (valid.length < 2) {
    return <p style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted }}>データ蓄積中…</p>;
  }
  const W = 640, H = 150, PAD_L = 34, PAD_R = 10, PAD_T = 12, PAD_B = 20;
  const ys = valid.map(p => p.y);
  let minY = Math.min(...ys), maxY = Math.max(...ys);
  if (ch.zero) { minY = Math.min(minY, 0); maxY = Math.max(maxY, 0); }
  if (ch.ref != null) { minY = Math.min(minY, ch.ref); maxY = Math.max(maxY, ch.ref); }
  const pad = (maxY - minY) * 0.12 || 1;
  minY -= pad; maxY += pad;
  const rangeY = maxY - minY || 1;
  const toX = (i: number) => PAD_L + (i / (valid.length - 1)) * (W - PAD_L - PAD_R);
  const toY = (y: number) => PAD_T + (1 - (y - minY) / rangeY) * (H - PAD_T - PAD_B);
  const linePts = valid.map((p, i) => `${toX(i).toFixed(1)},${toY(p.y).toFixed(1)}`).join(" ");
  const areaPts = `${PAD_L},${(H - PAD_B).toFixed(1)} ${linePts} ${(W - PAD_R).toFixed(1)},${(H - PAD_B).toFixed(1)}`;
  const ticks = [maxY, (minY + maxY) / 2, minY];
  const last = valid[valid.length - 1];
  const gid = `g${chartUid++}`;
  const fmtTick = (t: number) => (Math.abs(t) >= 10 ? Math.round(t).toString() : t.toFixed(1));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label={ch.t}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={toY(t)} x2={W - PAD_R} y2={toY(t)} stroke={line} strokeWidth="1" strokeDasharray="2,4" />
          <text x={PAD_L - 5} y={toY(t) + 3} textAnchor="end" fontSize="9" fill={muted} fontFamily="monospace">{fmtTick(t)}</text>
        </g>
      ))}
      {/* しきい値線（NOCTの基準線） */}
      {ch.ref != null && (
        <g>
          <line x1={PAD_L} y1={toY(ch.ref)} x2={W - PAD_R} y2={toY(ch.ref)} stroke={clay} strokeWidth="1" strokeDasharray="5,3" opacity="0.8" />
          {ch.ref_label && (
            <text x={W - PAD_R} y={toY(ch.ref) - 4} textAnchor="end" fontSize="8.5" fill={clay} fontFamily="monospace">{ch.ref_label}</text>
          )}
        </g>
      )}
      <polygon points={areaPts} fill={`url(#${gid})`} />
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={toX(valid.length - 1)} cy={toY(last.y)} r="3" fill={color} />
      <text x={PAD_L} y={H - 6} textAnchor="start" fontSize="9" fill={muted} fontFamily="monospace">{valid[0].x}</text>
      <text x={W - PAD_R} y={H - 6} textAnchor="end" fontSize="9" fill={muted} fontFamily="monospace">{last.x}</text>
    </svg>
  );
}

// ── パネル（自律神経／概日リズム）: バンド見出し＋複数グラフ＋各意図 ──────────
function MetricPanel({ p, color }: { p: CondPanel; color: string }) {
  const c = bandColor(p.level);
  return (
    <section style={{ marginBottom: "44px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <h2 style={{ fontFamily: "Palatino, serif", fontSize: "1.15rem" }}>{p.title}</h2>
          <span style={{ fontSize: "0.62rem", fontFamily: "monospace", color: muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>{p.en}</span>
        </div>
        <span style={{ fontSize: "0.85rem", fontFamily: "sans-serif", color: c, fontWeight: 600 }}>{p.label}</span>
      </div>
      <p style={{ fontSize: "0.74rem", fontFamily: "sans-serif", color: muted, lineHeight: 1.7, marginBottom: "22px", paddingBottom: "14px", borderBottom: border }}>
        {p.desc}
      </p>
      {p.charts.map((ch, i) => (
        <div key={ch.t} style={{ marginBottom: i < p.charts.length - 1 ? "30px" : 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "3px" }}>
            <span style={{ fontFamily: "Palatino, serif", fontSize: "0.95rem" }}>{ch.t}</span>
            {ch.unit && <span style={{ fontSize: "0.62rem", fontFamily: "monospace", color: muted }}>{ch.unit}</span>}
          </div>
          {/* NOCT風の「意図」: 何を見ているか / どう読むか */}
          <p style={{ fontSize: "0.72rem", fontFamily: "sans-serif", color: muted, lineHeight: 1.7, marginBottom: "10px" }}>
            {ch.what}<br />
            <span style={{ color: ink, opacity: 0.75 }}>見方 — {ch.how}</span>
          </p>
          <TrendChart ch={ch} color={color} />
        </div>
      ))}
    </section>
  );
}

// ── 評価バンド（自律神経・概日リズム・回復力） ──────────
function BandRow({ b }: { b: CondBand }) {
  const c = bandColor(b.level);
  return (
    <div style={{ padding: "16px 0", borderBottom: border }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{ fontFamily: "Palatino, serif", fontSize: "1rem", color: ink }}>{b.title}</span>
          <span style={{ fontSize: "0.62rem", fontFamily: "monospace", color: muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{b.en}</span>
        </div>
        <span style={{ fontSize: "0.85rem", fontFamily: "sans-serif", color: c, fontWeight: 600 }}>{b.label}</span>
      </div>
      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
        {[0, 1, 2, 3].map(i => (
          <span key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: i === b.level ? c : "#e2dccf" }} />
        ))}
      </div>
      <p style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted, marginBottom: "8px" }}>{b.note}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
        {b.readings.map(r => (
          <span key={r.k} style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted }}>
            {r.k} <span style={{ color: ink, fontFamily: "Palatino, serif" }}>{r.v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CondStatTile({ s }: { s: CondStat }) {
  const chips: { text: string; color: string }[] = [];
  if (s.delta_2w != null) chips.push({ text: `2週 ${s.delta_2w > 0 ? "+" : ""}${s.delta_2w}`, color: s.delta_2w > 0 ? clay : sage });
  if (s.dev_pct != null) chips.push({ text: `${s.dev_pct > 0 ? "+" : ""}${s.dev_pct}%`, color: s.dev_pct >= -8 ? sage : s.dev_pct <= -20 ? deepred : ochre });
  if (s.trend_pct != null) chips.push({ text: `${s.trend_pct > 0 ? "+" : ""}${s.trend_pct}%`, color: s.trend_pct >= 0 ? sage : ochre });
  if (s.recent != null) chips.push({ text: `直近 ${s.recent}`, color: muted });
  return (
    <div style={{ padding: "16px", backgroundColor: cardBg, borderRadius: "8px" }}>
      <p style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.08em", marginBottom: "6px" }}>{s.label}</p>
      <p style={{ fontFamily: "Palatino, serif", fontSize: "1.5rem", marginBottom: "2px", lineHeight: 1.1, color: ink }}>
        {s.value != null ? s.value : "—"}
        {s.unit && <span style={{ fontSize: "0.72rem", fontFamily: "sans-serif", color: muted, marginLeft: "3px" }}>{s.unit}</span>}
      </p>
      {s.sub && <p style={{ fontSize: "0.62rem", fontFamily: "sans-serif", color: muted, marginBottom: "6px" }}>{s.sub}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
        {chips.map((c, i) => (
          <span key={i} style={{ fontSize: "0.68rem", fontFamily: "sans-serif", color: c.color }}>{c.text}</span>
        ))}
      </div>
    </div>
  );
}

export default function HealthDashboardPage() {
  const c = condition;
  const ac = alertColor(c.overall.alert_level);
  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px 100px", color: ink }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "6px", fontFamily: "Palatino, serif" }}>今の私</h1>
      <p style={{ color: muted, fontSize: "0.8rem", fontFamily: "sans-serif", marginBottom: "36px" }}>
        夜勤の身体データ、定点観測（n=1）· 自律神経と概日リズムを NOCT で評価
      </p>

      {/* 総評の静かな1行 */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "28px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: ac, marginTop: "9px", flexShrink: 0 }} />
        <div>
          <p style={{ fontFamily: "Palatino, serif", fontSize: "1.2rem", lineHeight: 1.6 }}>{c.overall.line}</p>
          <p style={{ fontSize: "0.72rem", fontFamily: "sans-serif", color: muted, marginTop: "4px" }}>
            <span style={{ color: ac, fontWeight: 600 }}>{c.overall.alert_text}</span>
            {c.overall.alert_note && <span> · {c.overall.alert_note}</span>}
            <span style={{ marginLeft: "8px", fontFamily: "monospace", fontSize: "0.66rem" }}>{(c.generated ?? "").slice(0, 10)}</span>
          </p>
        </div>
      </div>

      {/* 主役の数値 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "40px" }}>
        <CondStatTile s={c.stats.resting_hr} />
        <CondStatTile s={c.stats.hrv} />
        <CondStatTile s={c.stats.vo2max} />
        <CondStatTile s={c.stats.recovery} />
      </div>

      {/* 評価バンド */}
      <section style={{ marginBottom: "44px" }}>
        <h2 style={{ fontSize: "0.68rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.15em", marginBottom: "4px" }}>
          ASSESSMENT · 評価
        </h2>
        {c.bands.map(b => <BandRow key={b.key} b={b} />)}
      </section>

      {/* 自律神経・概日リズムの推移グラフ（NOCTのパネルを移植・各グラフに意図つき） */}
      <div style={{ marginBottom: "8px" }}>
        <h2 style={{ fontSize: "0.68rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.15em", marginBottom: "24px" }}>
          TREND · 推移（直近70日・7日移動平均）
        </h2>
        <MetricPanel p={c.panels.ans} color={aiBlue} />
        <MetricPanel p={c.panels.circadian} color={bengara} />
      </div>

      {/* AIインサイトの一言 */}
      {c.ai_insight && (
        <div style={{ backgroundColor: cardBg, borderRadius: "8px", padding: "18px 20px", marginBottom: "32px" }}>
          <p style={{ fontSize: "0.64rem", fontFamily: "monospace", color: bengara, letterSpacing: "0.1em", marginBottom: "8px" }}>
            AI INSIGHT{c.ai_date ? ` · ${c.ai_date.slice(0, 10)}` : ""}
          </p>
          <p style={{ fontSize: "0.86rem", fontFamily: "sans-serif", lineHeight: 1.8 }}>{c.ai_insight}</p>
        </div>
      )}

      {/* NOCT 導線 */}
      <Link href="/tools/noct-demo" style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        fontSize: "0.78rem", fontFamily: "sans-serif", color: bengara,
      }}>
        自律神経・概日リズムを NOCT で詳しく見る →
      </Link>

      <div style={{ marginTop: "56px" }}>
        <a href="/tools" style={{ fontSize: "0.8rem", color: muted, fontFamily: "sans-serif" }}>← ツール一覧へ</a>
      </div>
    </main>
  );
}
