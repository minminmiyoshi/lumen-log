import portfolioData from "@/data/portfolio.json";

export type Holding = {
  ticker:        string;
  shares:        number;
  avgCost:       number;
  currency:      "USD" | "JPY";
  type:          "us" | "jp";
  sector?:       string;
  currentPrice?: number;
};

export type HoldingWithPrice = Holding & {
  currentPrice:    number;
  currentValue:    number;
  gainLoss:        number;
  gainLossPercent: number;
};

export type PortfolioLive = {
  holdings:       HoldingWithPrice[];
  usdJpy:         number;
  totalHoldingsJpy: number;
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

async function getUsdJpy(): Promise<number> {
  try {
    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=USD/JPY&apikey=${process.env.TWELVE_DATA_API_KEY}`,
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    return parseFloat(data.price ?? "0") || 150;
  } catch {
    return 150;
  }
}

export async function getPortfolioWithPrices(): Promise<HoldingWithPrice[]> {
  const holdings  = portfolioData as Holding[];
  const usTickers = holdings.filter((h) => h.type === "us").map((h) => h.ticker);
  const usPrices  = await getUsPrices(usTickers);

  return holdings.map((holding) => {
    const currentPrice =
      holding.type === "us" ? usPrices[holding.ticker] ?? 0 : holding.currentPrice ?? 0;
    const currentValue    = currentPrice * holding.shares;
    const costBasis       = holding.avgCost * holding.shares;
    const gainLoss        = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
    return { ...holding, currentPrice, currentValue, gainLoss, gainLossPercent };
  });
}

export async function getPortfolioLive(): Promise<PortfolioLive> {
  const [holdings, usdJpy] = await Promise.all([
    getPortfolioWithPrices(),
    getUsdJpy(),
  ]);

  const totalHoldingsJpy = holdings.reduce((sum, h) => {
    return sum + (h.currency === "USD" ? h.currentValue * usdJpy : h.currentValue);
  }, 0);

  return { holdings, usdJpy, totalHoldingsJpy };
}
