"use client"

// app/tools/health/page.tsx
import Link from 'next/link'

import { useEffect, useState } from "react";

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
  steps: string;
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
    name: string;
    start_time: string;
    duration_min: string;
    distance_km: string;
    calories: string;
    avg_hr: string;
    max_hr: string;
  };
  
  type HealthData = {
    garmin: GarminRow[];
    scale: ScaleRow[];
    workout: WorkoutRow[];
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

function StatCard({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div style={{ padding: "20px", backgroundColor: cardBg, borderRadius: "8px" }}>
      <p style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "8px" }}>
        {label}
      </p>
      <p style={{ fontFamily: "Palatino, serif", fontSize: "1.6rem", marginBottom: "4px" }}>
        {value}
        {unit && <span style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: muted, marginLeft: "4px" }}>{unit}</span>}
      </p>
      {sub && <p style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted }}>{sub}</p>}
    </div>
  );
}

function MiniBar({
  label,
  value,
  max,
  color = "#4CAF50",
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
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

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
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

  // 直近7日
  const recent7 = garmin.slice(-7);
  const latest = garmin[garmin.length - 1];
  const latestScale = scale[scale.length - 1];

  const avgSleep = recent7.reduce((s, r) => s + val(r.sleep_duration_h), 0) / (recent7.length || 1);
  const avgStress = recent7.reduce((s, r) => s + val(r.stress_avg), 0) / (recent7.length || 1);
  const avgHRV = recent7.filter(r => val(r.hrv_weekly_avg) > 0).reduce((s, r) => s + val(r.hrv_weekly_avg), 0) /
    (recent7.filter(r => val(r.hrv_weekly_avg) > 0).length || 1);

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      {/* ヘッダー */}
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Health Dashboard</h1>
      <p style={{ color: muted, fontSize: "0.8rem", fontFamily: "sans-serif", marginBottom: "40px" }}>
        Garmin × Apple Health × AI Scale の統合ログ
      </p>

      {/* Overview */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "16px" }}>
          OVERVIEW · 直近7日平均
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <StatCard label="SLEEP" value={avgSleep.toFixed(1)} unit="h" sub={`深睡眠 ${(recent7.reduce((s,r)=>s+val(r.deep_sleep_h),0)/recent7.length).toFixed(1)}h avg`} />
          <StatCard label="STRESS" value={avgStress.toFixed(0)} sub={latest ? `昨日 ${val(latest.stress_avg).toFixed(0)}` : ""} />
          <StatCard label="HRV (weekly avg)" value={avgHRV > 0 ? avgHRV.toFixed(0) : "—"} unit="ms" sub={latest?.hrv_status ?? ""} />
          <StatCard label="RESTING HR" value={latest ? val(latest.resting_hr).toFixed(0) : "—"} unit="bpm" />
        </div>
      </section>

      {/* 睡眠ログ */}
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

      {/* 体組成 */}
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

      {/* 当直パフォーマンス（任意入力） */}
      {/* ワークアウトログ */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "16px" }}>
          WORKOUT LOG · 直近7日
        </h2>
        {(() => {
          const recentWorkouts = (data?.workout ?? [])
            .filter((w) => {
              const d = new Date(w.date);
              const cutoff = new Date();
              cutoff.setDate(cutoff.getDate() - 7);
              return d >= cutoff;
            })
            .sort((a, b) => b.start_time.localeCompare(a.start_time));

          if (recentWorkouts.length === 0) {
            return (
              <p style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: muted }}>
                直近7日のワークアウト記録なし
              </p>
            );
          }

          return (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recentWorkouts.map((w) => (
                <li key={w.activity_id} style={{ borderBottom: border, padding: "14px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontFamily: "Palatino, serif", fontSize: "1rem", marginBottom: "4px" }}>
                        {w.name || w.activity_type}
                      </p>
                      <p style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted }}>
                        {fmtDate(w.date)} · {val(w.duration_min).toFixed(0)}分
                        {val(w.distance_km) > 0 && ` · ${val(w.distance_km).toFixed(2)}km`}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {val(w.avg_hr) > 0 && (
                        <p style={{ fontSize: "0.8rem", fontFamily: "sans-serif", marginBottom: "2px" }}>
                          ♥ {val(w.avg_hr).toFixed(0)} / {val(w.max_hr).toFixed(0)} bpm
                        </p>
                      )}
                      {val(w.calories) > 0 && (
                        <p style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted }}>
                          {val(w.calories).toFixed(0)} kcal
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()}
      </section>
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "8px" }}>
          DUTY LOG · 任意記録
        </h2>
        <p style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: muted, marginBottom: "16px" }}>
          ※ 未入力でもAI解析は動作します
        </p>
        <div style={{ padding: "20px", backgroundColor: cardBg, borderRadius: "8px" }}>
          <p style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: muted, textAlign: "center" }}>
            当直パフォーマンス入力 — 次フェーズで実装予定
          </p>
        </div>
      </section>

      {/* 当直パフォーマンスリンク */}
      <div style={{ marginTop: "48px" }}>
        <Link href="/tools/oncall" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ border: "1px solid #E8E4DF", borderRadius: "8px", padding: "20px 24px", cursor: "pointer" }}>
            <p style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: muted, letterSpacing: "0.1em", marginBottom: "6px" }}>DUTY</p>
            <p style={{ fontFamily: "Palatino, serif", fontSize: "1.1rem", marginBottom: "4px" }}>当直パフォーマンス</p>
            <p style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: muted }}>患者数・疲労度・Garminデータを紐付けて記録</p>
          </div>
        </Link>
      </div>

      {/* 戻るリンク */}
      <div style={{ marginTop: "64px" }}>
        <a href="/tools" style={{ fontSize: "0.875rem", color: muted, fontFamily: "sans-serif" }}>
          ← ツール一覧へ
        </a>
      </div>
    </main>
  );
}
