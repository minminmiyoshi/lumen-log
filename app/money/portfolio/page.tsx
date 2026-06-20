import publicData from "@/data/public_data.json";
import { getUsdJpy } from "@/lib/portfolio";
import PortfolioChart from "@/app/components/PortfolioChart";

export const revalidate = 300;

function fmtJpy(v: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(v);
}
function fmtMan(v: number) {
  return `${Math.round(v / 10000).toLocaleString()}万円`;
}

type SectorBreakdown = { sector: string; pct: number };
type PublicHolding   = { sector: string; gainLossPct: number | null };
type HistoryRow      = { date: string; total_jpy: number; rakuten_jpy: number; sbi_jpy: number };

const COLORS = ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#14B8A6","#F97316"];

export default async function PortfolioPage() {
  const usdJpy = await getUsdJpy();
  const port         = (publicData as any).portfolio ?? {};
  const asset        = port.asset_summary ?? {};
  const history      = (port.history ?? []) as HistoryRow[];
  const sectorBreak  = (port.sector_breakdown ?? []) as SectorBreakdown[];
  const pubHoldings  = (port.public_holdings  ?? []) as PublicHolding[];
  const summaryText  = port.summary_text ?? "";
  const updatedAt    = (port.updated_at ?? "").slice(0, 10);
  const marginLong   = port.margin_long_count  ?? 0;
  const marginShort  = port.margin_short_count ?? 0;

  // リアルタイム総資産計算
  const usdCashJpy      = (asset.usd_cash_usd ?? 0) * usdJpy;
  const marginCollateral = asset.margin_collateral_jpy ?? 0;
  const sbiJpy          = asset.sbi_jpy ?? 0;
  const holdingsJpy     = asset.holdings_jpy ?? 0;
  const realtimeTotal   = holdingsJpy + usdCashJpy + marginCollateral + sbiJpy;

  // 資産内訳
  const breakdown = [
    { label: "現物株式",   value: holdingsJpy,       color: "#3B82F6" },
    { label: "USD現金",    value: usdCashJpy,         color: "#10B981" },
    { label: "信用証拠金", value: marginCollateral,   color: "#F59E0B" },
    { label: "SBI(NISA)",  value: sbiJpy,             color: "#8B5CF6" },
  ];

  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 24px" }}>

      {/* ヘッダー */}
      <h1 style={{ fontSize: "1.5rem", marginBottom: "6px" }}>Portfolio</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginBottom: "40px", fontFamily: "sans-serif" }}>
        最終更新: {updatedAt}　USD/JPY: {usdJpy.toFixed(2)}　株価5分遅延
      </p>

      {/* 総資産 */}
      <section style={{ marginBottom: "40px", padding: "24px", backgroundColor: "#F0EDE8", borderRadius: "8px" }}>
        <p style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "sans-serif", marginBottom: "4px", letterSpacing: "0.1em" }}>
          TOTAL ASSETS
        </p>
        <p style={{ fontSize: "2.2rem", fontFamily: "Palatino, serif", marginBottom: "16px" }}>
          {fmtJpy(realtimeTotal)}
        </p>

        {/* 資産内訳バー */}
        <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
          {breakdown.map(({ label, value, color }) => (
            <div key={label} style={{ flex: value, backgroundColor: color }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {breakdown.map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
              <span style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: "var(--muted)" }}>
                {label}　{fmtMan(value)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AI要約 */}
      {summaryText && (
        <section style={{ marginBottom: "40px", padding: "20px 24px", border: "1px solid #E8E4DF", borderRadius: "8px" }}>
          <p style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "sans-serif", marginBottom: "8px", letterSpacing: "0.1em" }}>
            AI SUMMARY · gemma4:12b
          </p>
          <p style={{ fontSize: "0.93rem", fontFamily: "sans-serif", lineHeight: 1.75 }}>
            {summaryText}
          </p>
        </section>
      )}

      {/* 資産推移 */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: "var(--muted)", marginBottom: "16px", letterSpacing: "0.1em" }}>
          ASSET HISTORY
        </h2>
        <PortfolioChart history={history} />
      </section>

      {/* ポジション概要 */}
      <section style={{ display: "flex", gap: "12px", marginBottom: "48px" }}>
        {[
          { label: "現物",       value: port.holdings_count ?? 0 },
          { label: "信用ロング", value: marginLong },
          { label: "信用ショート", value: marginShort },
        ].map(({ label, value }) => (
          <div key={label} style={{ flex: 1, padding: "16px 12px", border: "1px solid #E8E4DF", borderRadius: "8px", textAlign: "center" }}>
            <p style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "sans-serif", marginBottom: "6px" }}>{label}</p>
            <p style={{ fontSize: "1.6rem", fontFamily: "Palatino, serif", lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "sans-serif", marginTop: "4px" }}>銘柄</p>
          </div>
        ))}
      </section>

      {/* セクター構成比 */}
      {sectorBreak.length > 0 && (
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: "var(--muted)", marginBottom: "20px", letterSpacing: "0.1em" }}>
            SECTOR BREAKDOWN（現物・時価比率）
          </h2>
          {sectorBreak.map(({ sector, pct }, i) => (
            <div key={sector} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontFamily: "sans-serif", fontSize: "0.85rem" }}>
                <span>{sector}</span>
                <span style={{ color: "var(--muted)" }}>{pct}%</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "#E8E4DF", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length], borderRadius: "3px" }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 現物保有一覧 */}
      {pubHoldings.length > 0 && (
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: "var(--muted)", marginBottom: "16px", letterSpacing: "0.1em" }}>
            HOLDINGS（現物）
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {pubHoldings.map(({ sector, gainLossPct }, i) => (
              <li key={i} style={{ borderBottom: "1px solid #E8E4DF", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: COLORS[sectorBreak.findIndex(s => s.sector === sector) % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontFamily: "sans-serif", fontSize: "0.9rem" }}>{sector}</span>
                </div>
                {gainLossPct !== null && (
                  <span style={{ fontFamily: "sans-serif", fontSize: "0.95rem", color: gainLossPct >= 0 ? "#10B981" : "#EF4444", fontWeight: 500 }}>
                    {gainLossPct >= 0 ? "+" : ""}{gainLossPct.toFixed(2)}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 信用建玉 */}
      {(marginLong > 0 || marginShort > 0) && (
        <section style={{ marginBottom: "48px", padding: "20px 24px", border: "1px solid #E8E4DF", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "0.75rem", fontFamily: "sans-serif", color: "var(--muted)", marginBottom: "16px", letterSpacing: "0.1em" }}>
            MARGIN POSITIONS
          </h2>
          <div style={{ display: "flex", gap: "24px", fontFamily: "sans-serif" }}>
            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>ロング　</span>
              <span style={{ fontSize: "1.1rem", color: "#3B82F6", fontWeight: 600 }}>{marginLong} 銘柄</span>
            </div>
            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>ショート　</span>
              <span style={{ fontSize: "1.1rem", color: "#EF4444", fontWeight: 600 }}>{marginShort} 銘柄</span>
            </div>
          </div>
        </section>
      )}

      <div style={{ marginTop: "64px" }}>
        <a href="/tools" style={{ fontSize: "0.875rem", color: "var(--muted)", fontFamily: "sans-serif" }}>← ツール一覧へ</a>
      </div>
    </main>
  );
}
