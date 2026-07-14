"use client"

import Link from 'next/link'
import { useEffect, useState } from "react";
import analysisDataRaw from "@/data/analysis.json";
import conditionRaw from "@/data/condition.json";

type AnalysisEntry = { generated_at?: string; period?: string; public?: string };
const analysisData: AnalysisEntry[] = Array.isArray(analysisDataRaw)
  ? (analysisDataRaw as AnalysisEntry[])
  : analysisDataRaw && Object.keys(analysisDataRaw).length > 0
  ? [analysisDataRaw as AnalysisEntry]
  : [];

type GarminRow = {
  date: string;
  sleep_duration_h: string;
  deep_sleep_h: string;
  rem_sleep_h: string;
  hrv_last_night: string;
  hrv_weekly_avg: string;
  resting_hr: string;
  stress_avg: string;
  body_battery_max: string;
  body_battery_min: string;
  hrv_status: string;
  steps: string;
  vo2max: string;
};

type ScaleRow = {
  date: string;
  weight_kg: string;
  body_fat_pct: string;
  skeletal_muscle_kg: string;
  bmr_kcal: string;
};

type WorkoutRow = {
  date: string;
  activity_id: string;
  activity_type: string;
  start_time: string;
  duration_min: string;
  distance_km: string;
  calories: string;
  avg_hr: string;
  max_hr: string;
};

type OncallEntry = {
  date: string;
  fatigueIn: number;
  fatigueOut: number;
  delta_fatigue: number;
  moodIn: number;
  moodOut: number;
  sleepiness: number;
  workload: number;
  nap_h: number;
  pre_nap_h?: number;
  preNapQuality?: number;
  hrv_change_pct: number | null;
  body_battery_drain: number | null;
  prev_hrv: number | null;
  prev_sleep_h: number | null;
  prev_resting_hr: number | null;
};

type OncallData = {
  summary: {
    count: number;
    avg_hrv_change_pct: number | null;
    avg_body_battery_drain: number | null;
    avg_nap_h: number | null;
    avg_delta_fatigue: number | null;
    avg_sleepiness: number | null;
    avg_fatigue_out: number | null;
  };
  entries: OncallEntry[];
};

type WeeklyIntensity = {
  week: string;
  low: number;
  mid: number;
  high: number;
};

type HealthData = {
  garmin: GarminRow[];
  scale: ScaleRow[];
  workout: WorkoutRow[];
  weeklyIntensity: WeeklyIntensity[];
};

function val(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return isNaN(n) ? 0 : n;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const muted = "var(--muted, #999)";
const cardBg = "#F0EDE8";
const border = "1px solid #E8E4DF";
const accent = "#5C6BC0";
const accentGreen = "#4fbc86";
const accentRed = "#f74f4f";
const accentOrange = "#f7a74f";
const accentPurple = "#bc4fbc";

// ── 「今の私」Current condition サマリー ──────────────────────
type CondStat = { value: number | null; unit?: string; label: string; sub?: string;
  delta_2w?: number | null; dev_pct?: number | null; trend_pct?: number | null;
  recent?: number | null; unrecovered?: number };
type CondBand = { key: string; title: string; en: string; level: number; label: string;
  note: string; readings: { k: string; v: string }[] };
type Condition = {
  generated?: string;
  overall: { line: string; alert_level: string; alert_text: string; alert_note: string | null };
  stats: { resting_hr: CondStat; hrv: CondStat; vo2max: CondStat; recovery: CondStat };
  bands: CondBand[];
  ai_insight: string | null;
  ai_date: string | null;
};
const condition = conditionRaw as unknown as Condition;

const alertColor = (lv: string) =>
  lv === "ok" ? accentGreen : lv === "tired" ? "#8fbf4f" : lv === "warn" ? accentOrange : accentRed;
const bandColor = (lv: number) =>
  lv <= 0 ? accentGreen : lv === 1 ? "#8fbf4f" : lv === 2 ? accentOrange : accentRed;

function BandRow({ b }: { b: CondBand }) {
  const c = bandColor(b.level);
  return (
    <div style={{ padding: "16px 0", borderBottom: border }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{ fontFamily: "Palatino, serif", fontSize: "1rem" }}>{b.title}</span>
          <span style={{ fontSize: "0.62rem", fontFamily: "monospace", color: muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{b.en}</span>
        </div>
        <span style={{ fontSize: "0.85rem", fontFamily: "sans-serif", color: c, fontWeight: 600 }}>{b.label}</span>
      </div>
      {/* 良好→要注意 の4段階インジケータ（該当位置を点灯） */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
        {[0, 1, 2, 3].map(i => (
          <span key={i} style={{
            flex: 1, height: "4px", borderRadius: "2px",
            backgroundColor: i === b.level ? c : "#E4E0DA",
          }} />
        ))}
      </div>
      <p style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted, marginBottom: "8px" }}>{b.note}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
        {b.readings.map(r => (
          <span key={r.k} style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted }}>
            {r.k} <span style={{ color: "#1a1a1a", fontFamily: "Palatino, serif" }}>{r.v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CondStatTile({ s }: { s: CondStat }) {
  // 増減の色: RHR/dev/trend はマイナスが良い/悪いを個別解釈せず、単純に符号で色付け
  const chips: { text: string; color: string }[] = [];
  if (s.delta_2w != null) chips.push({ text: `2週 ${s.delta_2w > 0 ? "+" : ""}${s.delta_2w}`, color: s.delta_2w > 0 ? accentRed : accentGreen });
  if (s.dev_pct != null) chips.push({ text: `${s.dev_pct > 0 ? "+" : ""}${s.dev_pct}%`, color: s.dev_pct >= -8 ? accentGreen : s.dev_pct <= -20 ? accentRed : accentOrange });
  if (s.trend_pct != null) chips.push({ text: `${s.trend_pct > 0 ? "+" : ""}${s.trend_pct}%`, color: s.trend_pct >= 0 ? accentGreen : accentOrange });
  if (s.recent != null) chips.push({ text: `直近 ${s.recent}`, color: muted });
  return (
    <div style={{ padding: "16px", backgroundColor: cardBg, borderRadius: "8px" }}>
      <p style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.08em", marginBottom: "6px" }}>{s.label}</p>
      <p style={{ fontFamily: "Palatino, serif", fontSize: "1.5rem", marginBottom: "2px", lineHeight: 1.1 }}>
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

function CurrentCondition() {
  const c = condition;
  if (!c || !c.overall) return null;
  const ac = alertColor(c.overall.alert_level);
  return (
    <section style={{ marginBottom: "48px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.15em" }}>
          今の私 · CURRENT CONDITION
        </h2>
        <span style={{ fontSize: "0.62rem", fontFamily: "monospace", color: muted }}>
          {(c.generated ?? "").slice(0, 10)}
        </span>
      </div>

      {/* 総評の静かな1行 */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "24px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: ac, marginTop: "8px", flexShrink: 0 }} />
        <div>
          <p style={{ fontFamily: "Palatino, serif", fontSize: "1.15rem", lineHeight: 1.6 }}>{c.overall.line}</p>
          <p style={{ fontSize: "0.72rem", fontFamily: "sans-serif", color: muted, marginTop: "4px" }}>
            <span style={{ color: ac, fontWeight: 600 }}>{c.overall.alert_text}</span>
            {c.overall.alert_note && <span> · {c.overall.alert_note}</span>}
          </p>
        </div>
      </div>

      {/* 主役の数値 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "28px" }}>
        <CondStatTile s={c.stats.resting_hr} />
        <CondStatTile s={c.stats.hrv} />
        <CondStatTile s={c.stats.vo2max} />
        <CondStatTile s={c.stats.recovery} />
      </div>

      {/* NOCTの評価バンド（自律神経・概日リズム・回復力） */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "0.66rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "4px" }}>
          自律神経・概日リズムの評価
        </p>
        {c.bands.map(b => <BandRow key={b.key} b={b} />)}
      </div>

      {/* AIインサイトの一言 */}
      {c.ai_insight && (
        <div style={{ backgroundColor: cardBg, borderRadius: "8px", padding: "18px 20px", marginBottom: "16px" }}>
          <p style={{ fontSize: "0.64rem", fontFamily: "monospace", color: accent, letterSpacing: "0.1em", marginBottom: "8px" }}>
            AI INSIGHT{c.ai_date ? ` · ${c.ai_date.slice(0, 10)}` : ""}
          </p>
          <p style={{ fontSize: "0.86rem", fontFamily: "sans-serif", lineHeight: 1.8 }}>{c.ai_insight}</p>
        </div>
      )}

      {/* NOCT 導線 */}
      <Link href="/tools/noct-demo" style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        fontSize: "0.75rem", fontFamily: "sans-serif", color: accent,
      }}>
        自律神経・概日リズムを NOCT で詳しく見る →
      </Link>
    </section>
  );
}

function StatCard({ label, value, unit, sub }: {
  label: string; value: string; unit?: string; sub?: string;
}) {
  return (
    <div style={{ padding: "20px", backgroundColor: cardBg, borderRadius: "8px" }}>
      <p style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "8px" }}>{label}</p>
      <p style={{ fontFamily: "Palatino, serif", fontSize: "1.6rem", marginBottom: "4px" }}>
        {value}
        {unit && <span style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: muted, marginLeft: "4px" }}>{unit}</span>}
      </p>
      {sub && <p style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted }}>{sub}</p>}
    </div>
  );
}

function MiniBar({ label, value, max, color = "#4CAF50" }: {
  label: string; value: number; max: number; color?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted }}>{label}</span>
        <span style={{ fontSize: "0.75rem", fontFamily: "sans-serif" }}>{value.toFixed(1)}</span>
      </div>
      <div style={{ height: "4px", backgroundColor: "#E8E4DF", borderRadius: "2px" }}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: "2px" }} />
      </div>
    </div>
  );
}

// シンプルな折れ線グラフ（SVG）
function LineChart({ data, color, label, unit = "", yMin, yMax, zeroLine = false }: {
  data: { x: string; y: number | null }[];
  color: string;
  label: string;
  unit?: string;
  yMin?: number;
  yMax?: number;
  zeroLine?: boolean;
}) {
  const valid = data.filter(d => d.y !== null) as { x: string; y: number }[];
  if (valid.length < 2) return (
    <div style={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted }}>データ蓄積中...</p>
    </div>
  );

  const W = 600; const H = 100; const PAD_L = 40; const PAD = 8;
  const ys = valid.map(d => d.y);
  const minY = yMin ?? Math.min(...ys);
  const maxY = yMax ?? Math.max(...ys);
  const rangeY = maxY - minY || 1;

  const toX = (i: number) => PAD_L + (i / (valid.length - 1)) * (W - PAD_L - PAD);
  const toY = (y: number) => H - PAD - ((y - minY) / rangeY) * (H - PAD * 2);

  const pts = valid.map((d, i) => `${toX(i)},${toY(d.y)}`).join(" ");
  const zeroY = toY(0);

  // Y軸目盛り（3本）
  const ticks = [minY, (minY + maxY) / 2, maxY];

  return (
    <div>
      <p style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.08em", marginBottom: "4px" }}>{label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100px" }}>
        {/* Y軸 */}
        <line x1={PAD_L} y1={PAD} x2={PAD_L} y2={H - PAD} stroke="#E8E4DF" strokeWidth="1" />
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD_L - 4} y1={toY(t)} x2={PAD_L} y2={toY(t)} stroke="#ccc" strokeWidth="1" />
            <text x={PAD_L - 6} y={toY(t) + 4} textAnchor="end" fontSize="10" fill={muted}>{Math.round(t)}</text>
          </g>
        ))}
        {zeroLine && zeroY >= 0 && zeroY <= H && (
          <line x1={PAD_L} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="#ccc" strokeDasharray="4,4" strokeWidth="1" />
        )}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {valid.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.y)} r="3" fill={color} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginLeft: `${PAD_L}px` }}>
        {valid.length > 0 && (
          <>
            <span style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted }}>{valid[0].x}</span>
            <span style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted }}>{valid[valid.length - 1].x}</span>
          </>
        )}
      </div>
    </div>
  );
}

// 棒グラフ（SVG）
function BarChart({ data, color, negColor, label, unit = "", zeroLine = false }: {
  data: { x: string; y: number | null }[];
  color: string;
  negColor?: string;
  label: string;
  unit?: string;
  zeroLine?: boolean;
}) {
  const valid = data.filter(d => d.y !== null) as { x: string; y: number }[];
  if (valid.length === 0) return (
    <div style={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted }}>データ蓄積中...</p>
    </div>
  );

  const W = 600; const H = 100; const PAD_L = 40; const PAD = 8;
  const ys = valid.map(d => d.y);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);
  const rangeY = maxY - minY || 1;
  const barW = Math.max(2, (W - PAD_L - PAD) / valid.length - 4);
  const toX = (i: number) => PAD_L + (i / valid.length) * (W - PAD_L - PAD) + barW / 2;
  const toY = (y: number) => H - PAD - ((y - minY) / rangeY) * (H - PAD * 2);
  const zeroY = H - PAD - ((0 - minY) / rangeY) * (H - PAD * 2);
  const ticks = [minY, (minY + maxY) / 2, maxY];

  return (
    <div>
      <p style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.08em", marginBottom: "4px" }}>{label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100px" }}>
        <line x1={PAD_L} y1={PAD} x2={PAD_L} y2={H - PAD} stroke="#E8E4DF" strokeWidth="1" />
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD_L - 4} y1={toY(t)} x2={PAD_L} y2={toY(t)} stroke="#ccc" strokeWidth="1" />
            <text x={PAD_L - 6} y={toY(t) + 4} textAnchor="end" fontSize="10" fill={muted}>{Math.round(t)}</text>
          </g>
        ))}
        {zeroLine && (
          <line x1={PAD_L} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="#ccc" strokeDasharray="4,4" strokeWidth="1" />
        )}
        {valid.map((d, i) => {
          const barColor = (negColor && d.y < 0) ? negColor : color;
          const barH = Math.abs(((d.y) / rangeY) * (H - PAD * 2));
          const barY = d.y >= 0 ? zeroY - barH : zeroY;
          return <rect key={i} x={toX(i) - barW / 2} y={barY} width={barW} height={barH} fill={barColor} rx="2" />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginLeft: `${PAD_L}px` }}>
        {valid.length > 0 && (
          <>
            <span style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted }}>{valid[0].x}</span>
            <span style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted }}>{valid[valid.length - 1].x}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [oncall, setOncall] = useState<OncallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"health" | "oncall" | "analysis">("health");

  useEffect(() => {
    Promise.all([
      fetch("/api/health").then(r => r.json()),
      fetch("/api/oncall-public").then(r => r.json()),
    ]).then(([h, o]) => {
      setData(h);
      setOncall(o);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
        <p style={{ color: muted, fontFamily: "sans-serif", fontSize: "0.85rem" }}>Loading...</p>
      </main>
    );
  }

  const garmin = data?.garmin ?? [];
  const scale = data?.scale ?? [];
  const recent7 = garmin.slice(-7);
  const latestScale = scale[scale.length - 1];

  const entries = (oncall?.entries ?? []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const summary = oncall?.summary;

  const tabStyle = (active: boolean) => ({
    padding: "8px 20px",
    fontSize: "0.75rem",
    fontFamily: "sans-serif",
    letterSpacing: "0.08em",
    cursor: "pointer",
    color: active ? "#1a1a1a" : muted,
    background: "none",
    borderTop: "none", borderLeft: "none", borderRight: "none",
    borderBottom: active ? "2px solid #1a1a1a" : "2px solid transparent",
  } as React.CSSProperties);

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Health Dashboard</h1>
      <p style={{ color: muted, fontSize: "0.8rem", fontFamily: "sans-serif", marginBottom: "24px" }}>
        Garmin × AI Scale × 夜勤ログの統合記録
      </p>

      {/* 今の私 — NOCTの評価から抜粋したサマリー */}
      <CurrentCondition />

      {/* タブ切り替え */}
      <div style={{ display: "flex", borderBottom: "1px solid #E8E4DF", marginBottom: "40px" }}>
        <button style={tabStyle(tab === "health")} onClick={() => setTab("health")}>DAILY HEALTH</button>
        <button style={tabStyle(tab === "oncall")} onClick={() => setTab("oncall")}>NIGHT SHIFT</button>
        <button style={tabStyle(tab === "analysis")} onClick={() => setTab("analysis")}>AI INSIGHT</button>
      </div>

      {/* ── DAILY HEALTH タブ ── */}
      {tab === "health" && (
        <>
          <section style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "24px" }}>
              TRENDS · 直近30日
            </h2>
            <div style={{ marginBottom: "32px" }}>
              <LineChart
                data={garmin.slice(-30).map(r => ({ x: fmtDate(r.date), y: val(r.hrv_last_night) || null }))}
                color={accentPurple} label="HRV last night (ms)" yMin={0} />
            </div>
            <div style={{ marginBottom: "32px" }}>
              <LineChart
                data={garmin.slice(-30).map(r => ({ x: fmtDate(r.date), y: val(r.sleep_duration_h) || null }))}
                color={accent} label="睡眠時間 (h)" yMin={0} yMax={10} />
            </div>
            <div style={{ marginBottom: "32px" }}>
              <LineChart
                data={garmin.slice(-30).map(r => ({ x: fmtDate(r.date), y: val(r.resting_hr) || null }))}
                color={accentRed} label="安静時心拍 (bpm)" yMin={40} yMax={80} />
            </div>
            <div>
              <LineChart
                data={garmin.slice(-30).filter(r => val(r.vo2max) > 0).map(r => ({ x: fmtDate(r.date), y: val(r.vo2max) || null }))}
                color={accentOrange} label="VO2max (mL/kg/min)" yMin={30} yMax={65} />
            </div>
          </section>

          <section style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "16px" }}>
              SLEEP LOG · 直近7日
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recent7.map((r) => (
                <li key={r.date} style={{ borderBottom: border, padding: "12px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "sans-serif", fontSize: "0.8rem", color: muted }}>{fmtDate(r.date)}</span>
                    <span style={{ fontFamily: "Palatino, serif", fontSize: "1rem" }}>{val(r.sleep_duration_h).toFixed(1)}h</span>
                  </div>
                  <MiniBar label="深睡眠" value={val(r.deep_sleep_h)} max={3} color="#5C6BC0" />
                  <MiniBar label="REM" value={val(r.rem_sleep_h)} max={3} color="#26A69A" />
                </li>
              ))}
            </ul>
          </section>

          {latestScale && (
            <section style={{ marginBottom: "48px" }}>
              <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "16px" }}>
                BODY COMPOSITION · 最終計測 {latestScale.date}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <StatCard label="WEIGHT" value={val(latestScale.weight_kg).toFixed(1)} unit="kg" />
                <StatCard label="BODY FAT" value={val(latestScale.body_fat_pct).toFixed(1)} unit="%" />
                <StatCard label="SKELETAL MUSCLE" value={val(latestScale.skeletal_muscle_kg).toFixed(2)} unit="kg" />
                <StatCard label="BMR" value={val(latestScale.bmr_kcal).toFixed(0)} unit="kcal" />
              </div>
            </section>
          )}


          <section style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "8px" }}>
              WORKOUT INTENSITY · 週次強度分布
            </h2>
            <p style={{ fontSize: "0.72rem", fontFamily: "sans-serif", color: muted, marginBottom: "20px" }}>
              低強度 &lt;126bpm　中強度 127–153bpm　高強度 &gt;154bpm（最大心拍数180bpm基準）
            </p>
            {(() => {
              const wi = (data?.weeklyIntensity ?? []).slice(-8);
              if (wi.length === 0) return (
                <p style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: muted }}>データなし</p>
              );
              const W = 600; const H = 120; const PAD_L = 40; const PAD = 8;
              const maxTotal = Math.max(...wi.map(w => w.low + w.mid + w.high), 1);
              const barW = Math.max(8, (W - PAD_L - PAD) / wi.length - 6);
              const toX = (i: number) => PAD_L + (i / wi.length) * (W - PAD_L - PAD) + barW / 2;
              const toH = (v: number) => (v / maxTotal) * (H - PAD * 2);
              const ticks = [0, Math.round(maxTotal / 2), maxTotal];
              const toY = (v: number) => H - PAD - (v / maxTotal) * (H - PAD * 2);
              return (
                <div>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "120px" }}>
                    <line x1={PAD_L} y1={PAD} x2={PAD_L} y2={H - PAD} stroke="#E8E4DF" strokeWidth="1" />
                    {ticks.map((t, i) => (
                      <g key={i}>
                        <line x1={PAD_L - 4} y1={toY(t)} x2={PAD_L} y2={toY(t)} stroke="#ccc" strokeWidth="1" />
                        <text x={PAD_L - 6} y={toY(t) + 4} textAnchor="end" fontSize="10" fill={muted}>{t}</text>
                      </g>
                    ))}
                    {wi.map((w, i) => {
                      const x = toX(i) - barW / 2;
                      const hHigh = toH(w.high);
                      const hMid  = toH(w.mid);
                      const hLow  = toH(w.low);
                      const yHigh = H - PAD - hHigh - hMid - hLow;
                      const yMid  = H - PAD - hMid - hLow;
                      const yLow  = H - PAD - hLow;
                      return (
                        <g key={w.week}>
                          <rect x={x} y={yHigh} width={barW} height={hHigh} fill={accentRed} rx="2" />
                          <rect x={x} y={yMid}  width={barW} height={hMid}  fill={accentOrange} />
                          <rect x={x} y={yLow}  width={barW} height={hLow}  fill={accentGreen} rx="2" />
                          <text x={toX(i)} y={H - 1} textAnchor="middle" fontSize="9" fill={muted}>
                            {w.week.slice(5)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <div style={{ display: "flex", gap: "16px", marginTop: "8px", marginLeft: `${PAD_L}px` }}>
                    <span style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: accentRed }}>■ 高強度</span>
                    <span style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: accentOrange }}>■ 中強度</span>
                    <span style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: accentGreen }}>■ 低強度</span>
                    <span style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted }}>(単位: 分)</span>
                  </div>
                </div>
              );
            })()}
          </section>

          <section style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "16px" }}>
              WORKOUT BY TYPE · 種目別累積時間
            </h2>
            {(() => {
              const workouts = data?.workout ?? [];
              if (workouts.length === 0) return (
                <p style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: muted }}>データなし</p>
              );
              const totals: Record<string, number> = {};
              for (const w of workouts) {
                const t = w.activity_type || "unknown";
                totals[t] = (totals[t] || 0) + val(w.duration_min);
              }
              const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
              const maxVal = sorted[0]?.[1] || 1;
              const colors = [accentPurple, accent, accentGreen, accentOrange, accentRed, "#aaa"];
              const W = 600; const H = sorted.length * 28 + 16; const PAD_L = 140; const PAD_R = 60;
              return (
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
                  {sorted.map(([type, mins], i) => {
                    const barW = ((mins / maxVal) * (W - PAD_L - PAD_R));
                    const y = i * 28 + 8;
                    return (
                      <g key={type}>
                        <text x={PAD_L - 8} y={y + 14} textAnchor="end" fontSize="11" fill={muted} fontFamily="sans-serif">{type}</text>
                        <rect x={PAD_L} y={y} width={barW} height={18} fill={colors[i % colors.length]} rx="2" opacity="0.85" />
                        <text x={PAD_L + barW + 6} y={y + 13} fontSize="11" fill={muted} fontFamily="sans-serif">{Math.round(mins)}分</text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()}
          </section>
        </>
      )}

      {/* ── NIGHT SHIFT タブ ── */}
      {tab === "oncall" && (
        <>
          {/* サマリーカード */}
          <section style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "16px" }}>
              SUMMARY · 累計{summary?.count ?? 0}回
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <StatCard label="AVG HRV CHANGE"
                value={summary?.avg_hrv_change_pct != null ? `${summary.avg_hrv_change_pct > 0 ? "+" : ""}${summary.avg_hrv_change_pct}` : "—"}
                unit="%" sub="夜勤翌日HRV変化率" />
              <StatCard label="AVG BODY BATTERY DRAIN"
                value={summary?.avg_body_battery_drain != null ? summary.avg_body_battery_drain.toFixed(0) : "—"}
                sub="夜勤中消耗量" />
              <StatCard label="AVG NAP"
                value={summary?.avg_nap_h != null ? summary.avg_nap_h.toFixed(1) : "—"}
                unit="h" sub="夜勤中仮眠時間" />
              <StatCard label="AVG SLEEPINESS"
                value={summary?.avg_sleepiness != null ? summary.avg_sleepiness.toFixed(1) : "—"}
                unit="/ 5" sub="深夜の眠気" />
            </div>
          </section>

          {/* グラフセクション */}
          {entries.length >= 2 ? (
            <>
              <section style={{ marginBottom: "48px" }}>
                <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "24px" }}>
                  OBJECTIVE KPI · 客観指標
                </h2>
                <div style={{ marginBottom: "32px" }}>
                  <BarChart
                    data={entries.map(e => ({ x: fmtDate(e.date), y: e.hrv_change_pct }))}
                    color={accentPurple} negColor={accentGreen}
                    label="翌日HRV変化率 (%)  ─  マイナスが消耗大" zeroLine />
                </div>
                <div>
                  <BarChart
                    data={entries.map(e => ({ x: fmtDate(e.date), y: e.body_battery_drain }))}
                    color={accentOrange}
                    label="Body Battery消耗量  ─  大きいほど負荷高" />
                </div>
              </section>

              <section style={{ marginBottom: "48px" }}>
                <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "24px" }}>
                  SUBJECTIVE KPI · 主観指標
                </h2>
                <div style={{ marginBottom: "32px" }}>
                  <BarChart
                    data={entries.map(e => ({ x: fmtDate(e.date), y: e.delta_fatigue }))}
                    color={accentRed} negColor={accentGreen}
                    label="ΔFatigue（消耗量）= 疲労度（明け）− 疲労度（入り）" zeroLine />
                </div>
                <div style={{ marginBottom: "32px" }}>
                  <LineChart
                    data={entries.map(e => ({ x: fmtDate(e.date), y: e.sleepiness }))}
                    color={accentOrange} label="眠気（深夜2〜3時）" yMin={1} yMax={5} />
                </div>
                <div>
                  <LineChart
                    data={entries.map(e => ({ x: fmtDate(e.date), y: e.nap_h }))}
                    color={accentGreen} label="夜勤中仮眠時間 (h)" yMin={0} />
                </div>
              </section>

              <section style={{ marginBottom: "48px" }}>
                <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "24px" }}>
                  PRE-SHIFT · 夜勤前コンディション
                </h2>
                <div style={{ marginBottom: "32px" }}>
                  <LineChart
                    data={entries.map(e => ({ x: fmtDate(e.date), y: e.prev_hrv }))}
                    color={accentPurple} label="夜勤前日HRV (ms)" yMin={0} />
                </div>
                <div>
                  <LineChart
                    data={entries.map(e => ({ x: fmtDate(e.date), y: e.pre_nap_h ?? null }))}
                    color={accentGreen} label="夜勤前昼寝 (h)" yMin={0} />
                </div>
              </section>
            </>
          ) : (
            <div style={{ padding: "40px 24px", backgroundColor: cardBg, borderRadius: "8px", textAlign: "center", marginBottom: "48px" }}>
              <p style={{ fontFamily: "Palatino, serif", fontSize: "1.1rem", marginBottom: "8px" }}>データ蓄積中</p>
              <p style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: muted }}>
                夜勤ログが2件以上になるとグラフが表示されます
              </p>
            </div>
          )}

          {/* ログ一覧 */}
          <section style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "16px" }}>
              LOG · 夜勤記録
            </h2>
            {entries.length === 0 ? (
              <p style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: muted }}>記録なし</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[...entries].reverse().map(e => {
                  const deltaColor = e.delta_fatigue > 0 ? accentRed : e.delta_fatigue < 0 ? accentGreen : muted;
                  const hrvColor = e.hrv_change_pct !== null
                    ? (e.hrv_change_pct < -5 ? accentRed : e.hrv_change_pct > 5 ? accentGreen : muted)
                    : muted;
                  return (
                    <li key={e.date} style={{ borderBottom: border, padding: "16px 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span style={{ fontFamily: "Palatino, serif", fontSize: "1rem" }}>{e.date}</span>
                        <span style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: deltaColor, fontWeight: "bold" }}>
                          ΔFatigue {e.delta_fatigue > 0 ? "+" : ""}{e.delta_fatigue}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        <div>
                          <p style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted }}>HRV変化率</p>
                          <p style={{ fontSize: "0.85rem", fontFamily: "sans-serif", color: hrvColor }}>
                            {e.hrv_change_pct !== null ? `${e.hrv_change_pct > 0 ? "+" : ""}${e.hrv_change_pct}%` : "—"}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted }}>BB消耗</p>
                          <p style={{ fontSize: "0.85rem", fontFamily: "sans-serif" }}>
                            {e.body_battery_drain !== null ? e.body_battery_drain : "—"}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted }}>仮眠</p>
                          <p style={{ fontSize: "0.85rem", fontFamily: "sans-serif" }}>{e.nap_h}h</p>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted }}>眠気</p>
                          <p style={{ fontSize: "0.85rem", fontFamily: "sans-serif" }}>{e.sleepiness}/5</p>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted }}>負荷感</p>
                          <p style={{ fontSize: "0.85rem", fontFamily: "sans-serif" }}>{e.workload}/5</p>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: muted }}>前日HRV</p>
                          <p style={{ fontSize: "0.85rem", fontFamily: "sans-serif" }}>
                            {e.prev_hrv !== null ? `${e.prev_hrv}ms` : "—"}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
      {/* ── AI INSIGHT タブ ── */}
      {tab === "analysis" && (
        <>
          <section style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: muted, fontFamily: "monospace", marginBottom: "24px" }}>
              AI INSIGHT · 統合パフォーマンス分析
            </h2>
            {analysisData.length > 0 ? (
              <>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "32px" }}>
                  <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: accent, letterSpacing: "0.1em" }}>{analysisData[0].generated_at}</span>
                    <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: muted, letterSpacing: "0.1em" }}>{analysisData[0].period}</span>
                  </div>
                  <p style={{ fontSize: "0.95rem", fontFamily: "sans-serif", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                    {analysisData[0].public}
                  </p>
                </div>

                {analysisData.length > 1 && (
                  <div style={{ marginTop: "32px" }}>
                    <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: muted, fontFamily: "monospace", marginBottom: "16px" }}>
                      過去の解析履歴（{analysisData.length - 1}件）
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {analysisData.slice(1).map((item, i) => (
                        <details key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "16px 20px" }}>
                          <summary style={{ cursor: "pointer", display: "flex", gap: "16px", flexWrap: "wrap", listStyle: "none" }}>
                            <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: accent, letterSpacing: "0.1em" }}>{item.generated_at}</span>
                            <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: muted, letterSpacing: "0.1em" }}>{item.period}</span>
                          </summary>
                          <p style={{ fontSize: "0.9rem", fontFamily: "sans-serif", lineHeight: "1.8", whiteSpace: "pre-wrap", marginTop: "16px" }}>
                            {item.public}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: "0.85rem", fontFamily: "sans-serif", color: muted }}>解析データがありません。Streamlitから解析を実行してください。</p>
            )}
          </section>
        </>
      )}


      <div style={{ marginTop: "64px" }}>
        <a href="/tools" style={{ fontSize: "0.875rem", color: muted, fontFamily: "sans-serif" }}>← ツール一覧へ</a>
      </div>
    </main>
  );
}