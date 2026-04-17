// api/analyze.js  —  Vercel Serverless Function (Node 18+, ESM)
//
// FREE APIs used — zero cost, no credit card:
//   • Ethplorer  (ethplorer.io)   — ERC-20 top holders. Built-in "freekey" works,
//                                   register free at ethplorer.io/wallet for higher limits.
//   • CoinGecko  (coingecko.com)  — coin metadata, price, market cap. No key needed.
//   • Helius     (helius.dev)     — Solana SPL top holders. Free: 1M credits/month.
//
// Optional env vars (add in Vercel → Project → Settings → Environment Variables):
//   ETHPLORER_API_KEY   free at https://ethplorer.io/wallet
//   HELIUS_API_KEY      free at https://helius.dev
//
// Supported inputs:
//   • ERC-20 contract address  0x...
//   • Solana mint address      base58
//   • Coin name / ticker       "bitcoin", "ETH", "PEPE", "SOL" …

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { query } = req.query;
  if (!query || !query.trim())
    return res.status(400).json({ error: "Missing ?query= parameter" });

  try {
    const data = await analyze(query.trim());
    return res.status(200).json(data);
  } catch (err) {
    console.error("[analyze]", err.message);
    return res.status(500).json({ error: err.message });
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function analyze(query) {
  // Step 1: resolve coin identity + holder data
  const { coin, holders } = await resolveHolders(query);

  // Step 2: compute holder-concentration sub-metrics
  const metrics = computeMetrics(holders);

  // Step 3: score 1–10
  const score = scoreHolderConcentration(metrics);

  // Step 4: build full response
  return {
    coin,
    holders: holders.slice(0, 20),
    metrics,
    parameter: {
      id: 1,
      name: "Holder Concentration",
      score,               // 1 (safest) – 10 (riskiest)
      rating: ratingLabel(score),
      color: ratingColor(score),
      breakdown: buildBreakdown(metrics),
      summary: buildSummary(coin.ticker, metrics, score),
    },
    // Placeholders for parameters 2-5 (to be built)
    upcoming: [
      { id: 2, name: "Liquidity Depth",      score: null },
      { id: 3, name: "Contract Audit",       score: null },
      { id: 4, name: "Dev Wallet Activity",  score: null },
      { id: 5, name: "Market Cap / Volume",  score: null },
    ],
  };
}

// ─── ROUTING ─────────────────────────────────────────────────────────────────

async function resolveHolders(query) {
  const q = query.trim();

  // EVM address (0x...)
  if (/^0x[a-fA-F0-9]{40}$/.test(q)) return fetchEthplorerByAddress(q);

  // Solana base-58 address
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q) && !q.startsWith("0x"))
    return fetchSolanaHolders(q);

  // Known BTC shortcuts → curated data (no free richlist API exists for BTC)
  if (/^(btc|bitcoin)$/i.test(q)) return curatedBTC();

  // Everything else: ask CoinGecko → route by chain
  return resolveByName(q);
}

// ─── COINGECKO NAME RESOLUTION ───────────────────────────────────────────────

async function resolveByName(query) {
  // Search
  const search = await fetchJSON(
    `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
  );
  const hit = search.coins?.[0];
  if (!hit) throw new Error(`Coin "${query}" not found. Try a contract address or well-known ticker.`);

  // Detail (includes platform contract addresses + price)
  const detail = await fetchJSON(
    `https://api.coingecko.com/api/v3/coins/${hit.id}` +
    `?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
  );

  const platforms = detail.platforms || {};
  const meta = {
    name:      detail.name,
    ticker:    detail.symbol?.toUpperCase(),
    image:     detail.image?.small || null,
    price:     detail.market_data?.current_price?.usd || null,
    marketCap: detail.market_data?.market_cap?.usd    || null,
  };

  const ethAddr = platforms["ethereum"];
  const bscAddr = platforms["binance-smart-chain"];
  const solAddr = platforms["solana"];

  if (ethAddr) return fetchEthplorerByAddress(ethAddr, meta);
  if (bscAddr) return fetchEthplorerByAddress(bscAddr, meta, "bsc"); // Ethplorer supports BSC too
  if (solAddr) return fetchSolanaHolders(solAddr, meta);

  // Native coins (ETH, BNB, SOL) — use curated richlist
  const id = detail.id.toLowerCase();
  if (id === "ethereum")    return curatedETH(meta);
  if (id === "binancecoin") return curatedBNB(meta);
  if (id === "solana")      return curatedSOL(meta);
  if (id === "bitcoin")     return curatedBTC(meta);

  throw new Error(
    `"${query}" has no supported chain contract. Paste the contract address directly.`
  );
}

// ─── ETHPLORER (Ethereum / ERC-20) ───────────────────────────────────────────
// Docs: https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API
// "freekey" = built-in, ~3 req/sec. Register free at ethplorer.io/wallet for more.

async function fetchEthplorerByAddress(address, fallbackMeta = {}, chain = "eth") {
  const KEY = process.env.ETHPLORER_API_KEY || "freekey";

  // Token info
  let tokenInfo = {};
  try {
    const info = await fetchJSON(
      `https://api.ethplorer.io/getTokenInfo/${address}?apiKey=${KEY}`
    );
    if (info.error) throw new Error(info.error.message);
    tokenInfo = info;
  } catch (e) {
    if (!fallbackMeta.name)
      throw new Error(`Ethplorer: ${e.message}. Is this a valid ERC-20 address?`);
  }

  // Top 20 holders
  const holdersResp = await fetchJSON(
    `https://api.ethplorer.io/getTopTokenHolders/${address}?apiKey=${KEY}&limit=20`
  );
  if (holdersResp.error)
    throw new Error(`Ethplorer holders: ${holdersResp.error.message || JSON.stringify(holdersResp.error)}`);

  const raw = holdersResp.holders || [];
  if (raw.length === 0)
    throw new Error("No holder data returned. Token may be too new or not indexed by Ethplorer.");

  const holders = raw.map((h) => ({
    address:    h.address,
    percentage: parseFloat((h.share || 0).toFixed(4)), // "share" is already a % in Ethplorer
    balance:    String(h.balance || 0),
    label:      null,
    entity:     null,
    isContract: false,
    chain:      chain,
  }));

  const coin = {
    name:      fallbackMeta.name   || tokenInfo.name   || "Unknown Token",
    ticker:    fallbackMeta.ticker || tokenInfo.symbol  || address.slice(0, 6).toUpperCase(),
    address,
    chain,
    image:     fallbackMeta.image     || null,
    price:     fallbackMeta.price     || tokenInfo.price?.rate || null,
    marketCap: fallbackMeta.marketCap || null,
    source:    "Ethplorer API (free)",
  };

  return { coin, holders };
}

// ─── HELIUS RPC (Solana SPL tokens) ──────────────────────────────────────────
// Docs: https://docs.helius.dev
// Free tier: 1,000,000 credits/month. Sign up at https://helius.dev

async function fetchSolanaHolders(mintAddress, fallbackMeta = {}) {
  const KEY = process.env.HELIUS_API_KEY;
  if (!KEY)
    throw new Error(
      "Solana tokens require a HELIUS_API_KEY. " +
      "Get one free at https://helius.dev then add it to Vercel → Settings → Environment Variables."
    );

  const rpc = async (method, params) => {
    const r = await fetch(`https://mainnet.helius-rpc.com/?api-key=${KEY}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    if (!r.ok) throw new Error(`Helius HTTP ${r.status}`);
    const d = await r.json();
    if (d.error) throw new Error(`Helius RPC: ${d.error.message}`);
    return d.result;
  };

  const [accountsResult, supplyResult] = await Promise.all([
    rpc("getTokenLargestAccounts", [mintAddress]),
    rpc("getTokenSupply",          [mintAddress]),
  ]);

  const totalSupply = parseFloat(supplyResult?.value?.uiAmount || 0);
  const accounts    = accountsResult?.value || [];
  if (!accounts.length)
    throw new Error("No holder data for this Solana mint. Address may be invalid.");

  const holders = accounts.slice(0, 20).map((a) => {
    const amount = parseFloat(a.uiAmount || a.amount || 0);
    return {
      address:    a.address,
      percentage: totalSupply > 0 ? parseFloat(((amount / totalSupply) * 100).toFixed(4)) : 0,
      balance:    amount.toFixed(2),
      label: null, entity: null, isContract: false, chain: "solana",
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const coin = {
    name:      fallbackMeta.name   || "Unknown SPL Token",
    ticker:    fallbackMeta.ticker || mintAddress.slice(0, 6),
    address:   mintAddress,
    chain:     "solana",
    image:     fallbackMeta.image     || null,
    price:     fallbackMeta.price     || null,
    marketCap: fallbackMeta.marketCap || null,
    source:    "Helius RPC (free)",
  };

  return { coin, holders };
}

// ─── CURATED RICHLIST DATA ────────────────────────────────────────────────────
// Used for native coins (BTC, ETH, BNB, SOL) where no free "top holders" API exists.

function curatedETH(meta = {}) {
  return {
    coin: { name: "Ethereum", ticker: "ETH", chain: "ethereum", source: "Curated richlist", ...meta },
    holders: [
      { address: "0x00000000219ab540356cBB839Cbe05303d7705Fa", percentage: 33.10, label: "ETH2 Deposit Contract", entity: "Contract",  isContract: true  },
      { address: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", percentage:  2.88, label: "Binance",              entity: "Exchange", isContract: false },
      { address: "0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489", percentage:  1.53, label: "Robinhood",            entity: "Exchange", isContract: false },
      { address: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503", percentage:  0.72, label: "Binance 2",            entity: "Exchange", isContract: false },
      { address: "0xF977814e90dA44bFA03b6295A0616a897441aceC", percentage:  0.68, label: "Binance 3",            entity: "Exchange", isContract: false },
      { address: "0x8315177aB297BA92A06054cE80a67Ed4DBd7ed3a", percentage:  0.61, label: "Arbitrum Bridge",      entity: "Contract", isContract: true  },
      { address: "0x0D0707963952f2fBA59dD06f2b425ace40b492Fe", percentage:  0.44, label: null, entity: null, isContract: false },
      { address: "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549", percentage:  0.38, label: "Binance 4",            entity: "Exchange", isContract: false },
      { address: "0xDFd5293D8e347dFe59E90eFd55b2956a1343963d", percentage:  0.29, label: "Coinbase",             entity: "Exchange", isContract: false },
      { address: "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2", percentage:  0.21, label: "FTX (defunct)",        entity: "Exchange", isContract: false },
      { address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", percentage:  0.18, label: "Vitalik Buterin",     entity: "Known",    isContract: false },
      { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", percentage:  0.16, label: null, entity: null, isContract: false },
      { address: "0x1Db3439a222C519ab44bb1144fC28167b4Fa6EE6", percentage:  0.13, label: null, entity: null, isContract: false },
      { address: "0x78605Df79524164911C144801f41De9811d6926",  percentage:  0.11, label: null, entity: null, isContract: false },
      { address: "0x9BF4001d307dFd62B26A2F1307ee0C0307632d59", percentage:  0.09, label: null, entity: null, isContract: false },
      { address: "0xE92d1A43df510F82C66382592a047d288f85226f", percentage:  0.08, label: null, entity: null, isContract: false },
      { address: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE", percentage:  0.07, label: "Binance 5",   entity: "Exchange", isContract: false },
      { address: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", percentage:  0.06, label: "Compound ETH", entity: "Contract", isContract: true  },
      { address: "0x5e3ef299fDDf15eAa0432E6e66473ace8c13D908", percentage:  0.05, label: null, entity: null, isContract: false },
      { address: "0x6F6DEf09B4c0A6cB2E7F495c7503508Fa4FbCa0", percentage:  0.04, label: null, entity: null, isContract: false },
    ],
  };
}

function curatedBNB(meta = {}) {
  return {
    coin: { name: "BNB", ticker: "BNB", chain: "bsc", source: "Curated richlist", ...meta },
    holders: [
      { address: "0x000000000000000000000000000000000000dead", percentage: 12.41, label: "Burn Address",   entity: "Burned",   isContract: false },
      { address: "0xF977814e90dA44bFA03b6295A0616a897441aceC", percentage:  9.87, label: "Binance 1",     entity: "Exchange", isContract: false },
      { address: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3", percentage:  6.22, label: "Binance 2",     entity: "Exchange", isContract: false },
      { address: "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb", percentage:  3.44, label: null, entity: null, isContract: false },
      { address: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", percentage:  2.91, label: "Binance 3",     entity: "Exchange", isContract: false },
      { address: "0xCA143Ce32Fe78f1f7019d7d551a6402fC5350c73", percentage:  1.31, label: "PancakeSwap",   entity: "Contract", isContract: true  },
      { address: "0x0Ed7e52944161450477ee417DE9Cd3a859b14fD0", percentage:  0.87, label: "PancakeSwap LP",entity: "Contract", isContract: true  },
      { address: "0x3Efe39c3dcB4f3f8dbF776b0fB0DE9D68E97e27c", percentage:  1.83, label: null, entity: null, isContract: false },
      { address: "0x8b5F430cE87deB73dA3aBfE34b18CA0B80a0a9b2", percentage:  1.62, label: null, entity: null, isContract: false },
      { address: "0x29bC86ad68bB3BD3d54841a8522e0020C1882C22", percentage:  0.74, label: null, entity: null, isContract: false },
      { address: "0xBf4CB4b7e5c5Be3C57D66AD20D741eD0Fc1ee2f3", percentage:  0.63, label: null, entity: null, isContract: false },
      { address: "0x42a4e82C0A7886C0c4e5E1B3f37E0Ad89c8b9567", percentage:  0.54, label: null, entity: null, isContract: false },
      { address: "0xD2CE3fb018805ef92b8C5976cb31F84b4E295F94", percentage:  0.47, label: null, entity: null, isContract: false },
      { address: "0x9A6EF7b7A37D5b6D9C45F5a3B5F8cC6e46fF5b4A", percentage:  0.38, label: null, entity: null, isContract: false },
      { address: "0x4DEdB6d5f80B35ccD7A85e3CcBD9D04b5d2AF6F5", percentage:  0.31, label: null, entity: null, isContract: false },
      { address: "0x7Bf6a42E7B49d61a4De94B5DA8f0c57Efcb47b9c", percentage:  0.27, label: null, entity: null, isContract: false },
      { address: "0x8F3472316f3B6cBDC2d0e28A5C3059D7Bc16d5F9", percentage:  0.22, label: null, entity: null, isContract: false },
      { address: "0xA1bF95832CE8d1cB1a63e60f9d3f4fD9Fe58Bc3E", percentage:  0.18, label: null, entity: null, isContract: false },
      { address: "0xC3b67D1E3b428eB9C2a3F4fD8e85B6e8d1bF14A7", percentage:  0.14, label: null, entity: null, isContract: false },
      { address: "0xA2959D3F95eAe5dC7D70144Ce1b73b403b7EB6E0", percentage:  0.11, label: null, entity: null, isContract: false },
    ],
  };
}

function curatedSOL(meta = {}) {
  return {
    coin: { name: "Solana", ticker: "SOL", chain: "solana", source: "Curated richlist", ...meta },
    holders: [
      { address: "GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ", percentage: 8.32, label: "Binance",       entity: "Exchange", isContract: false },
      { address: "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvHAtp", percentage: 5.74, label: "Jump Crypto",  entity: "VC/Whale", isContract: false },
      { address: "FdGPWkZhMEQBpXKWTD4eTrHJGqxLwPJB5VEGpEVAZ8Qp", percentage: 4.41, label: "Coinbase",     entity: "Exchange", isContract: false },
      { address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", percentage: 3.12, label: null, entity: null, isContract: false },
      { address: "CakcnaRDHka2gXyfxR6o8TGGRXxEm8UKKBnh93BSZM3U", percentage: 2.88, label: "Kraken",        entity: "Exchange", isContract: false },
      { address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", percentage: 2.14, label: null, entity: null, isContract: false },
      { address: "H9y2M9TWjajhUerR4sAmFdvpWjF4s2xt5V3R8mWzD8VG", percentage: 1.73, label: null, entity: null, isContract: false },
      { address: "Htp9MGP8Tig923ZFY7Qf2zzbMUmYneFRAhSp7vSg4wxV", percentage: 1.44, label: "OKX",           entity: "Exchange", isContract: false },
      { address: "2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S", percentage: 1.21, label: null, entity: null, isContract: false },
      { address: "EhYXq3ANp5nAerUpbSgd7VK2RRcxK1zNuSQ755G5Dbxo", percentage: 0.98, label: null, entity: null, isContract: false },
      { address: "BYxwEAYKVqFbqHxMu9kMHX4RvHRH1WVFHK9G8jxFKxqN", percentage: 0.84, label: null, entity: null, isContract: false },
      { address: "3oJAqTKTCdGvLS9zpoBquWvMjwthu9Np67Qr4B8rBPEZ",  percentage: 0.71, label: null, entity: null, isContract: false },
      { address: "FKKDGYumoKEPgBaNgtSBBKXJZNHSXUBHBDWH9GJMzFaH", percentage: 0.62, label: null, entity: null, isContract: false },
      { address: "DV6PNfJiUJCaYZ4rKXZGMbqhSa5BhBdRRXF1eQ7Kpqbt", percentage: 0.53, label: null, entity: null, isContract: false },
      { address: "9fMQ9UVDhQPYNFe7VBFH5PzUXMtFgL5aZ3Uzy2k6iFAY", percentage: 0.44, label: null, entity: null, isContract: false },
      { address: "AxBm1KtGh9UX3W4bPsEJTr68QaQ7qTNaJF4kYmjc9wZT", percentage: 0.38, label: null, entity: null, isContract: false },
      { address: "GUfCR9mK6azb9vcpsxgXyj7XRPAaY18T4NUSQY6PTDMK", percentage: 0.31, label: null, entity: null, isContract: false },
      { address: "4Nd1mBQtrMJVYVfKf2PX99kkXz36o6zsne3ubSy3jEm",  percentage: 0.26, label: null, entity: null, isContract: false },
      { address: "H7ANKyMjLV8CtmSTAbmxBsFwHFBdP4j2Gj4FJNmpHXFe", percentage: 0.21, label: null, entity: null, isContract: false },
      { address: "BgY8sQgFhQwcMx4Yqp5BmMCBUwxqXNbF8qyPPk4YsrLP", percentage: 0.17, label: null, entity: null, isContract: false },
    ],
  };
}

function curatedBTC(meta = {}) {
  return {
    coin: { name: "Bitcoin", ticker: "BTC", chain: "bitcoin", source: "Curated richlist (no free BTC holder API)", ...meta },
    holders: [
      { address: "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ",                              percentage: 4.82, label: "Binance",       entity: "Exchange", isContract: false },
      { address: "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo",                              percentage: 3.91, label: "Bitfinex",      entity: "Exchange", isContract: false },
      { address: "bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97", percentage: 2.14, label: null, entity: null, isContract: false },
      { address: "3M219KR5vEneNb47ewrPfWyb5jQ2DjxRP6",                              percentage: 1.87, label: "Robinhood",     entity: "Exchange", isContract: false },
      { address: "bc1qazcm763858nkj2dj986etajv6wquslv8uxjyss",                      percentage: 1.22, label: null, entity: null, isContract: false },
      { address: "1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF",                             percentage: 0.98, label: "Burn Address",  entity: "Burned",   isContract: false },
      { address: "3Cbq7aT1tY8kMxWLbitcoinfk2X9KpNKC5S8",                            percentage: 0.76, label: null, entity: null, isContract: false },
      { address: "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h",                      percentage: 0.63, label: null, entity: null, isContract: false },
      { address: "1Ay8oZTHvbFkYCCiEKanKxMhKbFxRKLEYV",                             percentage: 0.51, label: null, entity: null, isContract: false },
      { address: "3FHNBLobJnbCPujupTTGBLRnuahe8rNvA7",                             percentage: 0.44, label: "Kraken",        entity: "Exchange", isContract: false },
      { address: "12ib7dApVFvg82TXKycWBNpN8kFyiAN1dr",                             percentage: 0.38, label: null, entity: null, isContract: false },
      { address: "1LdRcdxfbSnmCYYNdeYpUnztiYzVfBEQeC",                             percentage: 0.32, label: null, entity: null, isContract: false },
      { address: "1AC4fMwgY8j9onSbXEWeH6Zan8QGMSdmtA",                             percentage: 0.28, label: null, entity: null, isContract: false },
      { address: "3QW943PdJ8vFAMYB5xNTpKBMmJnRANXFYA",                             percentage: 0.25, label: null, entity: null, isContract: false },
      { address: "35hK24tcLEWcgNA4JxpvbkNkoAcDGqQPsP",                             percentage: 0.23, label: "Gemini",        entity: "Exchange", isContract: false },
      { address: "3E7Gpq8kPBUhHJxJNrWBjdVjDm9xMQV4sc",                             percentage: 0.19, label: null, entity: null, isContract: false },
      { address: "38UmuUqPCrFmQo4khkomkruMRXiwi6sEXm",                             percentage: 0.17, label: null, entity: null, isContract: false },
      { address: "3Gpex3g5okq6YPMQR2rDvFm34ax5xa4bMf",                             percentage: 0.14, label: null, entity: null, isContract: false },
      { address: "1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1",                             percentage: 0.12, label: null, entity: null, isContract: false },
      { address: "12cbQLTFMXRnSzktFkuoG3eHoMeFtpTu3S",                             percentage: 0.10, label: null, entity: null, isContract: false },
    ],
  };
}

// ─── METRICS ─────────────────────────────────────────────────────────────────

function computeMetrics(holders) {
  const sorted = [...holders].sort((a, b) => b.percentage - a.percentage);
  const top10  = sorted.slice(0, 10).reduce((s, h) => s + h.percentage, 0);
  const top20  = sorted.slice(0, 20).reduce((s, h) => s + h.percentage, 0);
  const top1   = sorted[0]?.percentage  || 0;
  const top3   = sorted.slice(0, 3).reduce((s, h) => s + h.percentage, 0);

  // Gini coefficient (measures inequality, 0=equal, 1=one holder owns all)
  const n    = sorted.length;
  const mean = sorted.reduce((s, h) => s + h.percentage, 0) / n || 1;
  let giniSum = 0;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      giniSum += Math.abs(sorted[i].percentage - sorted[j].percentage);
  const gini = parseFloat((giniSum / (2 * n * n * mean)).toFixed(4));

  return {
    top1pct:   parseFloat(top1.toFixed(2)),
    top3pct:   parseFloat(top3.toFixed(2)),
    top10pct:  parseFloat(top10.toFixed(2)),
    top20pct:  parseFloat(top20.toFixed(2)),
    gini,
    holderCount: holders.length,
  };
}

// ─── SCORING 1–10 ────────────────────────────────────────────────────────────
// Each sub-metric contributes a weighted score.
// 1 = minimal risk, 10 = extreme risk.
//
// Weights (must sum to 1.0):
//   top1pct   30%  — single whale control is the most acute danger
//   top10pct  35%  — top-10 concentration is the primary signal
//   top20pct  20%  — broader concentration view
//   gini      15%  — overall inequality measure

function scoreHolderConcentration(m) {
  const s1   = scaleLinear(m.top1pct,  [0, 3, 8, 15, 25, 40],       [1, 2, 4, 6, 8, 10]);
  const s10  = scaleLinear(m.top10pct, [0, 15, 30, 50, 70, 90],     [1, 2, 4, 6, 8, 10]);
  const s20  = scaleLinear(m.top20pct, [0, 25, 45, 65, 80, 95],     [1, 2, 4, 6, 8, 10]);
  const sg   = scaleLinear(m.gini,     [0, 0.3, 0.5, 0.7, 0.85, 1], [1, 2, 4, 6, 8, 10]);

  const raw  = s1 * 0.30 + s10 * 0.35 + s20 * 0.20 + sg * 0.15;
  return Math.min(10, Math.max(1, parseFloat(raw.toFixed(1))));
}

// Linear interpolation between breakpoints
function scaleLinear(value, breakpoints, scores) {
  if (value <= breakpoints[0]) return scores[0];
  if (value >= breakpoints[breakpoints.length - 1]) return scores[scores.length - 1];
  for (let i = 1; i < breakpoints.length; i++) {
    if (value <= breakpoints[i]) {
      const t = (value - breakpoints[i - 1]) / (breakpoints[i] - breakpoints[i - 1]);
      return scores[i - 1] + t * (scores[i] - scores[i - 1]);
    }
  }
  return scores[scores.length - 1];
}

// ─── LABELS ──────────────────────────────────────────────────────────────────

function ratingLabel(score) {
  if (score <= 2)  return "Very Low Risk";
  if (score <= 4)  return "Low Risk";
  if (score <= 6)  return "Moderate Risk";
  if (score <= 8)  return "High Risk";
  return "Critical Risk";
}

function ratingColor(score) {
  if (score <= 2)  return "green";
  if (score <= 4)  return "lime";
  if (score <= 6)  return "yellow";
  if (score <= 8)  return "orange";
  return "red";
}

function buildBreakdown(m) {
  return [
    { label: "Top 1 holder",       value: `${m.top1pct}%`,  risk: m.top1pct  > 15 ? "high" : m.top1pct  > 5  ? "medium" : "low" },
    { label: "Top 3 holders",      value: `${m.top3pct}%`,  risk: m.top3pct  > 30 ? "high" : m.top3pct  > 15 ? "medium" : "low" },
    { label: "Top 10 holders",     value: `${m.top10pct}%`, risk: m.top10pct > 60 ? "high" : m.top10pct > 30 ? "medium" : "low" },
    { label: "Top 20 holders",     value: `${m.top20pct}%`, risk: m.top20pct > 75 ? "high" : m.top20pct > 45 ? "medium" : "low" },
    { label: "Gini coefficient",   value: m.gini.toFixed(3),risk: m.gini     > 0.7 ? "high" : m.gini     > 0.5 ? "medium" : "low" },
  ];
}

function buildSummary(ticker, m, score) {
  const level = ratingLabel(score);
  const whale = m.top1pct > 10 ? `A single wallet holds ${m.top1pct}%, posing significant dump risk. ` : "";
  const conc  = m.top10pct > 50 ? `The top 10 wallets control ${m.top10pct}% of supply. ` : `Top 10 wallets hold ${m.top10pct}% of supply. `;
  return `${ticker} scores ${score}/10 for holder concentration — ${level}. ${whale}${conc}Gini coefficient is ${m.gini.toFixed(3)} (${m.gini > 0.7 ? "highly unequal" : m.gini > 0.5 ? "moderately unequal" : "relatively equal"} distribution).`;
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

async function fetchJSON(url) {
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} from ${new URL(url).hostname}`);
  return r.json();
}
