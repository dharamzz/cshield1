// api/liquidity.js — Liquidity Depth Analysis Module
// CryptoShield — Parameter 2: Liquidity Depth (ETH chain tokens only)
//
// Data source: DexScreener API (free, no key required)
//   GET https://api.dexscreener.com/latest/dex/tokens/{address}
//   Returns all DEX pairs for a token with liquidity, volume, price data.
//
// Scoring:
//   Score 3 = High Risk   — liquidity % of market cap < 6%
//   Score 2 = Medium Risk — liquidity % of market cap >= 6% and < 11%
//   Score 1 = Low Risk    — liquidity % of market cap >= 11%
//
// Only supported for EVM tokens with a known contract address.
// ETH native, BTC, and NON-EVM coins return score: null.
// ─────────────────────────────────────────────────────────────────────────────

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/tokens";

// Minimum liquidity USD to include a pair (filters out dust pairs)
const MIN_PAIR_LIQUIDITY_USD = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// fetchLiquidity(contract, chain, meta)
//
// Returns a structured liquidity result object:
// {
//   score:       1 | 2 | 3 | null,
//   rating:      "Low Risk" | "Medium Risk" | "High Risk" | "N/A",
//   color:       "green" | "yellow" | "red" | "grey",
//   liquidityUsd:      number,   // total USD liquidity across all DEX pairs
//   marketCap:         number,   // from meta or DexScreener
//   liquidityPct:      number,   // liquidityUsd / marketCap * 100
//   pairCount:         number,   // number of active DEX pairs
//   topPairs:          Array,    // top 5 pairs by liquidity
//   breakdown:         Array,    // sub-metric rows for UI
//   summary:           string,   // human-readable summary
// }
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchLiquidity(contract, chain, meta = {}) {
  // Only supported for ETH chain ERC-20 tokens
  if (!contract || contract === "null" || chain !== "eth") {
    return nullResult(meta, chain);
  }

  let pairs = [];
  try {
    const r = await fetch(`${DEXSCREENER_API}/${contract}`, {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) throw new Error(`DexScreener HTTP ${r.status}`);
    const d = await r.json();
    pairs = d.pairs || [];
  } catch (e) {
    console.warn(`[Liquidity] DexScreener fetch failed: ${e.message}`);
    return errorResult(meta, e.message);
  }

  // Filter to significant pairs only (exclude dust)
  const activePairs = pairs.filter(
    p => (p.liquidity?.usd || 0) >= MIN_PAIR_LIQUIDITY_USD
  );

  if (!activePairs.length) {
    return {
      score:         3,
      rating:        "High Risk",
      color:         "red",
      liquidityUsd:  0,
      marketCap:     meta.marketCap || null,
      liquidityPct:  0,
      pairCount:     0,
      topPairs:      [],
      breakdown:     buildBreakdown(0, 0, 0, meta.marketCap || 0),
      summary:       `${meta.ticker || "Token"} — High Risk (score 3/3). No active DEX liquidity found.`,
    };
  }

  // Aggregate liquidity across all pairs
  const totalLiquidityUsd = activePairs.reduce(
    (sum, p) => sum + (p.liquidity?.usd || 0), 0
  );

  // Use market cap from meta (CoinGecko) or fall back to DexScreener fdv
  let marketCap = meta.marketCap || 0;
  if (!marketCap) {
    // Try to derive from DexScreener's fdv or market cap field
    const bestPair = activePairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
    marketCap = bestPair?.marketCap || bestPair?.fdv || 0;
  }

  const liquidityPct = marketCap > 0
    ? parseFloat(((totalLiquidityUsd / marketCap) * 100).toFixed(2))
    : 0;

  // Score
  let score, rating, color;
  if (liquidityPct < 6) {
    score = 3; rating = "High Risk";   color = "red";
  } else if (liquidityPct < 11) {
    score = 2; rating = "Medium Risk"; color = "yellow";
  } else {
    score = 1; rating = "Low Risk";    color = "green";
  }

  // Top 5 pairs by liquidity
  const topPairs = activePairs
    .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
    .slice(0, 5)
    .map(p => ({
      dex:           p.dexId || "Unknown DEX",
      pairAddress:   p.pairAddress || null,
      baseSymbol:    p.baseToken?.symbol || "?",
      quoteSymbol:   p.quoteToken?.symbol || "?",
      liquidityUsd:  p.liquidity?.usd || 0,
      volume24h:     p.volume?.h24 || 0,
      priceUsd:      p.priceUsd ? parseFloat(p.priceUsd) : null,
      txns24h:       (p.txns?.h24?.buys || 0) + (p.txns?.h24?.sells || 0),
      url:           p.url || null,
    }));

  const ticker = meta.ticker || "Token";
  const summary = `${ticker} — ${rating} (score ${score}/3). ` +
    `Total DEX liquidity: $${formatUsd(totalLiquidityUsd)} ` +
    `(${liquidityPct}% of market cap) across ${activePairs.length} active pair${activePairs.length !== 1 ? "s" : ""}.`;

  return {
    score,
    rating,
    color,
    liquidityUsd:  totalLiquidityUsd,
    marketCap,
    liquidityPct,
    pairCount:     activePairs.length,
    topPairs,
    breakdown:     buildBreakdown(totalLiquidityUsd, liquidityPct, activePairs.length, marketCap),
    summary,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildBreakdown(totalLiqUsd, liquidityPct, pairCount, marketCap) {
  return [
    {
      label: "Total DEX liquidity",
      value: `$${formatUsd(totalLiqUsd)}`,
      note:  "combined across all active DEX pairs",
      risk:  liquidityPct < 6 ? "high" : liquidityPct < 11 ? "medium" : "low",
    },
    {
      label: "Liquidity / Market cap",
      value: `${liquidityPct}%`,
      note:  "higher % = more liquid, lower risk",
      risk:  liquidityPct < 6 ? "high" : liquidityPct < 11 ? "medium" : "low",
    },
    {
      label: "Market cap",
      value: `$${formatUsd(marketCap)}`,
      note:  "from CoinGecko",
      risk:  "low",
    },
    {
      label: "Active DEX pairs",
      value: `${pairCount}`,
      note:  `pairs with ≥ $${MIN_PAIR_LIQUIDITY_USD.toLocaleString()} liquidity`,
      risk:  pairCount === 0 ? "high" : pairCount < 3 ? "medium" : "low",
    },
  ];
}

function nullResult(meta, chain) {
  const reason = !chain || chain === "null"
    ? "No chain data available"
    : chain !== "eth"
      ? `Liquidity analysis only supported for ETH chain (this token is on ${chain})`
      : "No contract address";
  return {
    score:        null,
    rating:       "N/A",
    color:        "grey",
    liquidityUsd: null,
    marketCap:    meta.marketCap || null,
    liquidityPct: null,
    pairCount:    null,
    topPairs:     [],
    breakdown:    [],
    summary:      reason,
  };
}

function errorResult(meta, errMsg) {
  return {
    score:        null,
    rating:       "Unavailable",
    color:        "grey",
    liquidityUsd: null,
    marketCap:    meta.marketCap || null,
    liquidityPct: null,
    pairCount:    null,
    topPairs:     [],
    breakdown:    [],
    summary:      `Liquidity data unavailable: ${errMsg}`,
  };
}

function formatUsd(n) {
  if (!n || n === 0) return "0";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(0);
}
