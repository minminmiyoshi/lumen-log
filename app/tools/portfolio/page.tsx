import { getPortfolioWithPrices } from "@/lib/portfolio";

export const revalidate = 300;

function fmt(value: number, currency: string) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function PortfolioPage() {
  const holdings = await getPortfolioWithPrices();

  const totalValue = holdings.reduce((sum, h) => {
    const valueInJpy =
      h.currency === "USD" ? h.currentValue * 150 : h.currentValue;
    return sum + valueInJpy;
  }, 0);

  const totalCost = holdings.reduce((sum, h) => {
    const costInJpy =
      h.currency === "USD" ? h.avgCost * h.shares * 150 : h.avgCost * h.shares;
    return sum + costInJpy;
  }, 0);

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = (totalGainLoss / totalCost) * 100;

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Portfolio</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "40px", fontFamily: "sans-serif" }}>
        ※ USD→JPY換算は固定レート150円
      </p>

      {/* サマリー */}
      <section style={{ marginBottom: "48px", padding: "24px", backgroundColor: "#F0EDE8", borderRadius: "8px" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "sans-serif", marginBottom: "4px" }}>
          総評価額（円換算）
        </p>
        <p style={{ fontSize: "2rem", fontFamily: "Palatino, serif", marginBottom: "8px" }}>
          {fmt(totalValue, "JPY")}
        </p>
        <p style={{
          fontSize: "0.9rem",
          fontFamily: "sans-serif",
          color: totalGainLoss >= 0 ? "#4CAF50" : "#F44336",
        }}>
          {totalGainLoss >= 0 ? "+" : ""}{fmt(totalGainLoss, "JPY")}（{totalGainLossPercent.toFixed(2)}%）
        </p>
      </section>

      {/* 銘柄一覧 */}
      <section>
        <h2 style={{ fontSize: "0.8rem", fontFamily: "sans-serif", color: "var(--muted)", marginBottom: "16px", letterSpacing: "0.1em" }}>
          HOLDINGS
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {holdings.map((h) => (
            <li
              key={h.ticker}
              style={{
                borderBottom: "1px solid #E8E4DF",
                padding: "16px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontFamily: "Palatino, serif", fontSize: "1.1rem", marginBottom: "4px" }}>
                  {h.ticker}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
                  {h.shares}株 · 取得単価 {fmt(h.avgCost, h.currency)}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "sans-serif", fontSize: "1rem", marginBottom: "4px" }}>
                  {fmt(h.currentPrice, h.currency)}
                </p>
                <p style={{
                  fontSize: "0.8rem",
                  fontFamily: "sans-serif",
                  color: h.gainLoss >= 0 ? "#4CAF50" : "#F44336",
                }}>
                  {h.gainLoss >= 0 ? "+" : ""}{h.gainLossPercent.toFixed(2)}%
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 戻るリンク */}
      <div style={{ marginTop: "64px" }}>
        <a href="/tools" style={{ fontSize: "0.875rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
          ← ツール一覧へ
        </a>
      </div>
    </main>
  );
}