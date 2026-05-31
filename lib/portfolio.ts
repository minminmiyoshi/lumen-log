import portfolioData from "@/data/portfolio.json";

export type Holding = {
  ticker: string;
  shares: number;
  avgCost: number;
  currency: "USD" | "JPY";
  type: "us" | "jp";
  currentPrice?: number;
};

export type HoldingWithPrice = Holding & {
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
};

async function getUsPrices(tickers: string[]): Promise<Record<string, number>> {
  if (tickers.length === 0) return {};

  const symbol = tickers.join(",");
  const res = await fetch(
    `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_DATA_API_KEY}`,
    { next: { revalidate: 300 } }
  );
  const data = await res.json();

  const prices: Record<string, number> = {};
  if (tickers.length === 1) {
    prices[tickers[0]] = parseFloat(data.price ?? "0");
  } else {
    for (const ticker of tickers) {
      prices[ticker] = parseFloat(data[ticker]?.price ?? "0");
    }
  }
  return prices;
}

export async function getPortfolioWithPrices(): Promise<HoldingWithPrice[]> {
  const holdings = portfolioData as Holding[];

  const usTickers = holdings.filter((h) => h.type === "us").map((h) => h.ticker);
  const usPrices = await getUsPrices(usTickers);

  return holdings.map((holding) => {
    const currentPrice =
      holding.type === "us"
        ? usPrices[holding.ticker] ?? 0
        : holding.currentPrice ?? 0;

    const currentValue = currentPrice * holding.shares;
    const costBasis = holding.avgCost * holding.shares;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    return {
      ...holding,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercent,
    };
  });
}