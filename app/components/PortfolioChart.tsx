"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

type HistoryRow = { date: string; total_jpy: number; rakuten_jpy: number; sbi_jpy: number };

export default function PortfolioChart({ history }: { history: HistoryRow[] }) {
  if (history.length < 2) {
    return (
      <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "sans-serif", textAlign: "center", padding: "24px 0" }}>
        資産推移グラフは2回以上の記録後に表示されます
      </p>
    );
  }

  const data = history.map((r) => ({
    date:    r.date.slice(5),
    総資産:  Math.round(r.total_jpy / 1e4),
    楽天:    Math.round(r.rakuten_jpy / 1e4),
    SBI:     Math.round(r.sbi_jpy / 1e4),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} unit="万" width={52} />
        <Tooltip formatter={(v: number) => `${v.toLocaleString()}万円`} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.75rem" }} />
        <Line type="monotone" dataKey="総資産" stroke="#3B82F6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="楽天"   stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="SBI"    stroke="#10B981" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}
