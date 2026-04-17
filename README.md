# CryptoRisk — Crypto Coin Risk Calculator

Score any crypto coin **1–10** across 5 on-chain risk parameters.  
100% free APIs. No credit card. Deploy to Vercel in minutes.

---

## Files

```
├── index.html          Homepage — search input
├── results.html        Results page — risk score + holder breakdown
├── api/
│   └── analyze.js      Vercel serverless function (all the logic)
├── vercel.json         API routing
├── package.json
└── README.md
```

---

## Parameter 1: Holder Concentration (LIVE)

Scored 1–10 using 4 weighted sub-metrics:

| Sub-metric      | Weight | What it measures                         |
|-----------------|--------|------------------------------------------|
| Top 1 holder %  | 30%    | Single-whale control / dump risk         |
| Top 10 holders %| 35%    | Primary concentration signal             |
| Top 20 holders %| 20%    | Broader distribution view                |
| Gini coefficient| 15%    | Statistical inequality across all holders|

### Score scale
| Score | Rating        | Meaning                                  |
|-------|---------------|------------------------------------------|
| 1–2   | Very Low Risk | Highly decentralised                     |
| 3–4   | Low Risk      | Healthy distribution                     |
| 5–6   | Moderate Risk | Some concentration — monitor             |
| 7–8   | High Risk     | Significant dump risk                    |
| 9–10  | Critical Risk | Extreme concentration / rug pull danger  |

---

## APIs Used (all 100% free)

| API        | What for                          | Key needed?          |
|------------|-----------------------------------|----------------------|
| Ethplorer  | ERC-20 top 20 holders             | Optional (freekey works) |
| CoinGecko  | Coin name → chain + price data    | No                   |
| Helius RPC | Solana SPL top holders            | Yes (free at helius.dev) |
| Curated    | BTC, ETH, BNB, SOL native coins   | No                   |

---

## Setup & Deploy

### 1. Add files to your GitHub repo

Drop all files into your repo root, keeping the `api/` folder:
```
your-repo/
├── index.html
├── results.html
├── api/analyze.js
├── vercel.json
├── package.json
└── README.md
```

### 2. Connect to Vercel (if not already)
- Go to vercel.com → Add New Project → Import your GitHub repo
- Leave all settings as default → Deploy

### 3. Add free API keys (optional but recommended)

In **Vercel → Your Project → Settings → Environment Variables**, add:

```
ETHPLORER_API_KEY   # Free at https://ethplorer.io/wallet
                    # Without this, "freekey" still works (~3 req/sec)

HELIUS_API_KEY      # Free at https://helius.dev (1M credits/month)
                    # Required for Solana SPL token addresses
```

### 4. Redeploy
After adding env vars: **Vercel → Deployments → Redeploy**

---

## What works without any API keys

- BTC / Bitcoin
- ETH / Ethereum  
- BNB / Binance Coin
- SOL / Solana
- PEPE (via Ethplorer freekey + CoinGecko)
- Any ERC-20 contract address (0x...) via Ethplorer freekey

---

## Local development

```bash
npm install -g vercel
vercel dev        # runs at http://localhost:3000
```

---

## Coming next (Parameters 2–5)

- **Parameter 2** — Liquidity depth (DEX pool size, slippage risk)
- **Parameter 3** — Contract audit (verified source, known vulnerabilities)
- **Parameter 4** — Dev wallet activity (team sell pressure)
- **Parameter 5** — Market cap vs volume ratio (wash trading risk)

Each will contribute to a single **overall risk score** (1–10 weighted average).

---

## API Response Format

`GET /api/analyze?query=PEPE`

```json
{
  "coin": {
    "name": "Pepe",
    "ticker": "PEPE",
    "chain": "ethereum",
    "chainLabel": "Ethereum (ERC-20)",
    "price": 0.0000134,
    "marketCap": 5600000000,
    "source": "Ethplorer API (free)"
  },
  "holders": [...],
  "metrics": {
    "top1pct": 18.4,
    "top3pct": 39.5,
    "top10pct": 68.3,
    "top20pct": 79.1,
    "gini": 0.81
  },
  "parameter": {
    "id": 1,
    "name": "Holder Concentration",
    "score": 8.7,
    "rating": "High Risk",
    "color": "orange",
    "breakdown": [...],
    "summary": "PEPE scores 8.7/10 ..."
  },
  "upcoming": [
    { "id": 2, "name": "Liquidity Depth", "score": null },
    ...
  ]
}
```
