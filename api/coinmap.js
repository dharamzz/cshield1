// coinmap.js — Coin lookup table for CryptoRisk
// ─────────────────────────────────────────────────────────────────────────────
// Structure: each entry = one unique token/coin.
//
//   aliases  — array of lowercase strings (tickers, names, common variants)
//              The lookup index is built from these at startup.
//   cgId     — CoinGecko coin ID (used for price/image metadata only)
//   type     — chain category:
//                "BTC"     = Bitcoin (its own dedicated fetcher)
//                "EVM"     = any EVM chain (Ethereum, BSC, Polygon, Arbitrum, Base, …)
//                "NON-EVM" = non-EVM native coins (SOL, XRP, ADA, DOT, …)
//                            → these return an "unsupported" message to the user
//   contract — EVM contract address (lowercase), or null for native coins
//   chain    — Moralis chain ID: "eth", "bsc", "polygon", "arbitrum", "base",
//              "optimism", "avalanche", "fantom", "cronos", etc.
//              null for BTC and NON-EVM coins
//
// HOW TO ADD MORE COINS
// ─────────────────────
// 1. Find the right section (by chain or category).
// 2. Add a new object to the COINS array — always include the `type` field:
//
//   EVM token:    { aliases:["ticker","name"], cgId:"cg-id", type:"EVM",     contract:"0x...", chain:"eth" }
//   Bitcoin:      { aliases:["btc","bitcoin"], cgId:"bitcoin", type:"BTC",   contract:null,   chain:null  }
//   Non-EVM coin: { aliases:["sol","solana"],  cgId:"solana",  type:"NON-EVM",contract:null,  chain:null  }
//
// 3. Deploy — no other files need changing.
//
// The lookup index (built once at module load) maps every alias → its entry,
// so lookups are O(1) regardless of how many coins are in the file.
// ─────────────────────────────────────────────────────────────────────────────

export const COINS = [

  // ══════════════════════════════════════════════════════════════════════════
  // NATIVE COINS (contract: null — handled by dedicated fetchers in analyze.js)
  // ══════════════════════════════════════════════════════════════════════════
  { aliases:["btc","bitcoin"],                    cgId:"bitcoin", type:"BTC",           contract:null, chain:null },
  { aliases:["eth","ethereum","ether"],            cgId:"ethereum", type:"NON-EVM",          contract:null, chain:null },

  // ══════════════════════════════════════════════════════════════════════════
  // ETHEREUM — ERC-20 (chain: "eth")
  // ══════════════════════════════════════════════════════════════════════════

  // ── Stablecoins ──────────────────────────────────────────────────────────
  { aliases:["usdt","tether"],                     cgId:"tether", type:"EVM",            contract:"0xdac17f958d2ee523a2206206994597c13d831ec7", chain:"eth" },
  { aliases:["usdc","usd coin"],                   cgId:"usd-coin", type:"EVM",          contract:"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", chain:"eth" },
  { aliases:["dai","multi-collateral dai"],         cgId:"dai", type:"EVM",               contract:"0x6b175474e89094c44da98b954eedeac495271d0f", chain:"eth" },
  { aliases:["usds","sky usd"],                    cgId:"usds", type:"EVM",              contract:"0xdc035d45d973e3ec169d2276ddab16f1e407384f", chain:"eth" },
  { aliases:["frax","frax usd"],                   cgId:"frax", type:"EVM",              contract:"0x853d955acef822db058eb8505911ed77f175b99e", chain:"eth" },
  { aliases:["tusd","true usd"],                   cgId:"true-usd", type:"EVM",          contract:"0x0000000000085d4780b73119b644ae5ecd22b376", chain:"eth" },
  { aliases:["busd","binance usd"],                cgId:"binance-usd", type:"EVM",       contract:"0x4fabb145d64652a948d72533023f6e7a623c7c53", chain:"eth" },
  { aliases:["usde","ethena usde"],                cgId:"ethena-usde", type:"EVM",       contract:"0x4c9edd5852cd905f086c759e8383e09bff1e68b3", chain:"eth" },
  { aliases:["susde","staked usde","ethena staked usde"], cgId:"ethena-staked-usde", type:"EVM", contract:"0x9d39a5de30e57443bff2a8307a4256c8797a3497", chain:"eth" },
  { aliases:["pyusd","paypal usd"],                cgId:"paypal-usd", type:"EVM",        contract:"0x6c3ea9036406852006290770bedfcaba0e23a0e8", chain:"eth" },
  { aliases:["rlusd","ripple usd"],                cgId:"ripple-usd", type:"EVM",        contract:"0x8292bb45bf1ee4d140127049757c2e0ff06317ed", chain:"eth" },
  { aliases:["usdg","global dollar"],              cgId:"global-dollar", type:"EVM",     contract:"0xf8b1378579659d8f7ee5f3c929c2f3e332e41fd4", chain:"eth" },
  { aliases:["usdy","ondo us dollar yield"],       cgId:"ondo-us-dollar-yield", type:"EVM", contract:"0x96f6ef951840721adbf46ac996b59e0235cb985c", chain:"eth" },
  { aliases:["suds","savings usds"],               cgId:"savings-usds", type:"EVM",      contract:"0xa3931d71877c0e7a3148cb7eb4463524fec27fbd", chain:"eth" },
  { aliases:["gusd","gemini dollar"],              cgId:"gemini-dollar", type:"EVM",     contract:"0x056fd409e1d7a124bd7017459dfea2f387b6d5cd", chain:"eth" },
  { aliases:["lusd","liquity usd"],                cgId:"liquity-usd", type:"EVM",       contract:"0x5f98805a4e8be255a32880fdec7f6728c6568ba0", chain:"eth" },
  { aliases:["mkusd","prisma mkusd"],              cgId:"prisma-mkusd", type:"EVM",      contract:"0x4591dbff62656e7859afe5e45f6f47d3669fbb28", chain:"eth" },
  { aliases:["crvusd","curve usd"],                cgId:"crvusd", type:"EVM",            contract:"0xf939e0a03fb07f59a73314e73794be0e57ac1b4e", chain:"eth" },
  { aliases:["gho","aave gho"],                    cgId:"gho", type:"EVM",               contract:"0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f", chain:"eth" },
  { aliases:["alusd","alchemix usd"],              cgId:"alchemix-usd", type:"EVM",      contract:"0xbc6da0fe9ad5f3b0d58160288917aa56653660e9", chain:"eth" },
  { aliases:["ousd","origin usd"],                 cgId:"origin-dollar", type:"EVM",     contract:"0x2a8e1e676ec238d8a992307b495b45b3feaa5e86", chain:"eth" },
  { aliases:["musd","mstable usd"],                cgId:"musd", type:"EVM",              contract:"0xe2f2a5c287993345a840db3b0845fbc70f5935a5", chain:"eth" },
  { aliases:["dola","dola usd stablecoin"],        cgId:"dola-usd", type:"EVM",          contract:"0x865377367054516e17014ccded1e7d814edc9ce4", chain:"eth" },
  { aliases:["fei","fei usd"],                     cgId:"fei-usd", type:"EVM",           contract:"0x956f47f50a910163d8bf957cf5846d573e7f87ca", chain:"eth" },
  { aliases:["rai","reflexer ungovernance"],       cgId:"rai", type:"EVM",               contract:"0x03ab458634910aad20ef5f1c8ee96f1d6ac54919", chain:"eth" },
  { aliases:["volt","volt protocol"],              cgId:"volt-protocol", type:"EVM",     contract:"0x559ebc30b0e58a45cc9ff573f77ef1e5eb1b3e18", chain:"eth" },
  { aliases:["usdp","pax usd"],                    cgId:"paxos-standard", type:"EVM",    contract:"0x8e870d67f660d95d5be530380d0ec0bd388289e1", chain:"eth" },
  { aliases:["husd","huobi usd"],                  cgId:"husd", type:"EVM",              contract:"0xdf574c24545e5ffecb9a659c229253d4111d87e1", chain:"eth" },

  // ── Wrapped / Yield-bearing assets ──────────────────────────────────────
  { aliases:["wbtc","wrapped bitcoin"],            cgId:"wrapped-bitcoin", type:"EVM",   contract:"0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", chain:"eth" },
  { aliases:["weth","wrapped ether"],              cgId:"weth", type:"EVM",              contract:"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", chain:"eth" },
  { aliases:["steth","lido staked eth"],           cgId:"staked-ether", type:"EVM",      contract:"0xae7ab96520de3a18e5e111b5eaab095312d7fe84", chain:"eth" },
  { aliases:["wsteth","wrapped steth"],            cgId:"wrapped-steth", type:"EVM",     contract:"0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", chain:"eth" },
  { aliases:["reth","rocket pool eth"],            cgId:"rocket-pool-eth", type:"EVM",   contract:"0xae78736cd615f374d3085123a210448e74fc6393", chain:"eth" },
  { aliases:["cbeth","coinbase wrapped staked eth"], cgId:"coinbase-wrapped-staked-eth", type:"EVM", contract:"0xbe9895146f7af43049ca1c1ae358b0541ea49704", chain:"eth" },
  { aliases:["cbbtc","coinbase wrapped btc"],      cgId:"coinbase-wrapped-btc", type:"EVM", contract:"0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf", chain:"eth" },
  { aliases:["weeth","wrapped eeth"],              cgId:"wrapped-eeth", type:"EVM",      contract:"0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee", chain:"eth" },
  { aliases:["wbeth","wrapped beacon eth"],        cgId:"wrapped-beacon-eth", type:"EVM", contract:"0xa2e3356610840701bdf5611a53974510ae27e2e1", chain:"eth" },
  { aliases:["rseth","kelp restaked eth"],         cgId:"kelp-dao-restaked-eth", type:"EVM", contract:"0xa1290d69c65a6fe4df752f95823fae25cb99e5a7", chain:"eth" },
  { aliases:["aweth","aave weth"],                 cgId:"aave-weth", type:"EVM",         contract:"0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8", chain:"eth" },
  { aliases:["ezeth","renzo restaked eth"],        cgId:"renzo-restaked-eth", type:"EVM", contract:"0xbf5495efe5db9ce00f80364c8b423567e58d2110", chain:"eth" },
  { aliases:["oseth","stakewise eth"],             cgId:"stakewise-v3-oseth", type:"EVM", contract:"0xf1c9acdc66974dfb6decb12aa385b9cd01190e38", chain:"eth" },
  { aliases:["sfrxeth","staked frax ether"],       cgId:"staked-frax-ether", type:"EVM", contract:"0xac3e018457b222d93114458476f3e3416abbe38f", chain:"eth" },
  { aliases:["frxeth","frax ether"],               cgId:"frax-ether", type:"EVM",        contract:"0x5e8422345238f34275888049021821e8e08caa1f", chain:"eth" },
  { aliases:["meth","mantle staked eth"],          cgId:"mantle-staked-ether", type:"EVM", contract:"0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa", chain:"eth" },
  { aliases:["sweth","swell eth"],                 cgId:"sweth", type:"EVM",             contract:"0xf951e335afb289353dc249e82926178eac7ded78", chain:"eth" },
  { aliases:["tbtc","threshold network btc"],      cgId:"tbtc", type:"EVM",              contract:"0x18084fba666a33d37592fa2633fd49a74dd93a88", chain:"eth" },
  { aliases:["renbtc","ren btc"],                  cgId:"renbtc", type:"EVM",            contract:"0xeb4c2781e4eba804ce9a9803c67d0893436bb27d", chain:"eth" },
  { aliases:["hbtc","huobi btc"],                  cgId:"huobi-btc", type:"EVM",         contract:"0x0316eb71485b0ab14103307bf65a021042c6d380", chain:"eth" },
  { aliases:["abtc","allbtc"],                     cgId:"allbtc", type:"EVM",            contract:"0xf17a3fe536f8f7847f1385ec1bc967b2ca9cae8d", chain:"eth" },
  { aliases:["rbtc","rskroot btc"],                cgId:"rootstock", type:"NON-EVM",         contract:null, chain:null },

  // ── Precious metals ──────────────────────────────────────────────────────
  { aliases:["xaut","tether gold"],               cgId:"tether-gold", type:"EVM",       contract:"0x68749665ff8d2d112fa859aa293f07a622782f38", chain:"eth" },
  { aliases:["paxg","pax gold"],                  cgId:"pax-gold", type:"EVM",          contract:"0x45804880de22913dafe09f4980848ece6ecbaf78", chain:"eth" },
  { aliases:["oz","oz gold"],                     cgId:"oz-gold", type:"EVM",           contract:"0x9e1d37b851b38429cce3bf79de7b2f7f785c9b91", chain:"eth" },
  { aliases:["cache","cache gold"],               cgId:"cache-gold", type:"EVM",        contract:"0xf5238462e7235c7b62811567e63dd17d12c2eaa0", chain:"eth" },

  // ── Exchange / Platform tokens ──────────────────────────────────────────
  { aliases:["leo","leo token","bitfinex leo"],    cgId:"leo-token", type:"EVM",         contract:"0x2af5d2ad76741191d15dfe7bf6ac92d4bd912ca3", chain:"eth" },
  { aliases:["okb","okx token"],                  cgId:"okb", type:"EVM",               contract:"0x75231f58b43240c9718dd58b4967c5114342a86c", chain:"eth" },
  { aliases:["bnb","binancecoin","binance coin"],  cgId:"binancecoin", type:"EVM",       contract:"0xb8c77482e45f1f44de1745f52c74426c631bdd52", chain:"eth" },
  { aliases:["cro","cronos","crypto.com"],         cgId:"crypto-com-chain", type:"EVM",  contract:"0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b", chain:"eth" },
  { aliases:["mnt","mantle"],                     cgId:"mantle", type:"EVM",            contract:"0x3c3a81e81dc49a522a592e7622a7e711c06bf354", chain:"eth" },
  { aliases:["htx","huobi token"],                cgId:"huobi-token", type:"EVM",       contract:"0x6f259637dcd74c767781e37bc6133cd6a68aa161", chain:"eth" },
  { aliases:["bgb","bitget token"],               cgId:"bitget-token", type:"EVM",      contract:"0x19de6b897ed14a376dda0fe53a5420d2ac828a28", chain:"eth" },
  { aliases:["gt","gatechain token","gate token"], cgId:"gatechain-token", type:"EVM",   contract:"0xe66747a101bff2dba3697199dcce5b743b454759", chain:"eth" },
  { aliases:["kcs","kucoin token"],               cgId:"kucoin-shares", type:"EVM",     contract:"0xf34960d9d60be18cc1d5afc1a6f012a723a28811", chain:"eth" },
  { aliases:["bnt","bancor"],                     cgId:"bancor", type:"EVM",            contract:"0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c", chain:"eth" },
  { aliases:["nexo","nexo token"],                cgId:"nexo", type:"EVM",              contract:"0xb62132e35a6c13ee1ee0f84dc5d40bad8d815206", chain:"eth" },
  { aliases:["cel","celsius"],                    cgId:"celsius-degree-token", type:"EVM", contract:"0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d", chain:"eth" },
  { aliases:["celo","celo native"],               cgId:"celo", type:"NON-EVM",              contract:null, chain:null },

  // ── DeFi blue chips ──────────────────────────────────────────────────────
  { aliases:["link","chainlink"],                 cgId:"chainlink", type:"EVM",         contract:"0x514910771af9ca656af840dff83e8264ecf986ca", chain:"eth" },
  { aliases:["uni","uniswap"],                    cgId:"uniswap", type:"EVM",           contract:"0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", chain:"eth" },
  { aliases:["aave"],                             cgId:"aave", type:"EVM",              contract:"0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", chain:"eth" },
  { aliases:["mkr","maker"],                      cgId:"maker", type:"EVM",             contract:"0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", chain:"eth" },
  { aliases:["crv","curve dao token","curve"],    cgId:"curve-dao-token", type:"EVM",   contract:"0xd533a949740bb3306d119cc777fa900ba034cd52", chain:"eth" },
  { aliases:["snx","synthetix"],                  cgId:"havven", type:"EVM",            contract:"0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", chain:"eth" },
  { aliases:["comp","compound"],                  cgId:"compound-governance-token", type:"EVM", contract:"0xc00e94cb662c3520282e6f5717214004a7f26888", chain:"eth" },
  { aliases:["yfi","yearn finance","yearn"],      cgId:"yearn-finance", type:"EVM",     contract:"0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e", chain:"eth" },
  { aliases:["bal","balancer"],                   cgId:"balancer", type:"EVM",          contract:"0xba100000625a3754423978a60c9317c58a424e3d", chain:"eth" },
  { aliases:["sushi","sushiswap"],                cgId:"sushi", type:"EVM",             contract:"0x6b3595068778dd592e39a122f4f5a5cf09c90fe2", chain:"eth" },
  { aliases:["1inch"],                            cgId:"1inch", type:"EVM",             contract:"0x111111111117dc0aa78b770fa6a738034120c302", chain:"eth" },
  { aliases:["cvx","convex finance","convex"],    cgId:"convex-finance", type:"EVM",    contract:"0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b", chain:"eth" },
  { aliases:["ldo","lido dao","lido"],            cgId:"lido-dao", type:"EVM",          contract:"0x5a98fcbea516cf06857215779fd812ca3bef1b32", chain:"eth" },
  { aliases:["fxs","frax share"],                 cgId:"frax-share", type:"EVM",        contract:"0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0", chain:"eth" },
  { aliases:["lqty","liquity"],                   cgId:"liquity", type:"EVM",           contract:"0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d", chain:"eth" },
  { aliases:["rpl","rocket pool"],                cgId:"rocket-pool", type:"EVM",       contract:"0xd33526068d116ce69f19a9ee46f0bd304f21a51f", chain:"eth" },
  { aliases:["gno","gnosis"],                     cgId:"gnosis", type:"EVM",            contract:"0x6810e776880c02933d47db1b9fc05908e5386b96", chain:"eth" },
  { aliases:["sky","sky token"],                  cgId:"sky", type:"EVM",               contract:"0x56072c95faa701256059aa122697b133aded9279", chain:"eth" },
  { aliases:["ethfi","ether.fi"],                 cgId:"ether-fi", type:"EVM",          contract:"0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb", chain:"eth" },
  { aliases:["ena","ethena"],                     cgId:"ethena", type:"EVM",            contract:"0x57e114b691db790c35207b2e685d4a43181e6061", chain:"eth" },
  { aliases:["pendle"],                           cgId:"pendle", type:"EVM",            contract:"0x808507121b80c02388fad14726482e061b8da827", chain:"eth" },
  { aliases:["ondo","ondo finance"],              cgId:"ondo-finance", type:"EVM",      contract:"0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3", chain:"eth" },
  { aliases:["woo","woo network"],                cgId:"woo-network", type:"EVM",       contract:"0x4691937a7508860f876c9c0a2a617e7d9e945d4b", chain:"eth" },
  { aliases:["dydx"],                             cgId:"dydx", type:"EVM",              contract:"0x92d6c1e31e14520e676a687f0a93788b716beff5", chain:"eth" },
  { aliases:["perp","perpetual protocol"],        cgId:"perpetual-protocol", type:"EVM", contract:"0xbc396689893d065f41bc2c6ecbee5e0085233447", chain:"eth" },
  { aliases:["rbn","ribbon finance"],             cgId:"ribbon-finance", type:"EVM",    contract:"0x6123b0049f904d730db3c36a31167d9d4121fa6b", chain:"eth" },
  { aliases:["badger","badgerdao"],               cgId:"badger-dao", type:"EVM",        contract:"0x3472a5a71965499acd81997a54bba8d852c064a1", chain:"eth" },
  { aliases:["flt","float capital"],              cgId:"float-capital", type:"NON-EVM",     contract:null, chain:null },
  { aliases:["alcx","alchemix"],                  cgId:"alchemix", type:"EVM",          contract:"0xdbdb4d16eda451d0503b854cf79d55697f90c8df", chain:"eth" },
  { aliases:["idle","idle finance"],              cgId:"idle", type:"EVM",              contract:"0x875773784af8135ea0ef43b5a374aad105c5d39e", chain:"eth" },
  { aliases:["alpha","alpha finance"],            cgId:"alpha-finance", type:"EVM",     contract:"0xa1faa113cbe53436df28ff0aee54275c13b40975", chain:"eth" },
  { aliases:["cream","cream finance"],            cgId:"cream-2", type:"EVM",           contract:"0x2ba592f78db6436527729929aaf6c908497cb200", chain:"eth" },
  { aliases:["akro","akropolis"],                 cgId:"akropolis", type:"EVM",         contract:"0x8ab7404063ec4dbcfd4598215992dc3f8ec853d7", chain:"eth" },
  { aliases:["swrv","swerve"],                    cgId:"swerve-dao", type:"EVM",        contract:"0xb8baa0e4287890a5f79863ab62b7f175cecbd433", chain:"eth" },
  { aliases:["dpi","defi pulse index"],           cgId:"defi-pulse-index", type:"EVM",  contract:"0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b", chain:"eth" },
  { aliases:["index","index coop"],               cgId:"index-cooperative", type:"EVM", contract:"0x0954906da0bf32d5479e25f46056d22f08464cab", chain:"eth" },
  { aliases:["btrfly","redacted cartel"],         cgId:"butterflydao", type:"EVM",      contract:"0xc0d4ceb216b3ba9c3701b291766fdcba977cec3a", chain:"eth" },
  { aliases:["toke","tokemak"],                   cgId:"tokemak", type:"EVM",           contract:"0x2e9d63788249371f1dfc918a52f8d799f4a38c94", chain:"eth" },
  { aliases:["tribe","fei tribe"],                cgId:"tribe-2", type:"EVM",           contract:"0xc7283b66eb1eb5fb86327f08e1b5816b0720212b", chain:"eth" },
  { aliases:["rai"],                              cgId:"rai", type:"EVM",               contract:"0x03ab458634910aad20ef5f1c8ee96f1d6ac54919", chain:"eth" },
  { aliases:["ohm","olympus dao"],                cgId:"olympus", type:"EVM",           contract:"0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5", chain:"eth" },
  { aliases:["spell","spell token","abracadabra"], cgId:"spell-token", type:"EVM",      contract:"0x090185f2135308bad17527004364ebcc2d37e5f6", chain:"eth" },
  { aliases:["mim","magic internet money"],       cgId:"magic-internet-money", type:"EVM", contract:"0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3", chain:"eth" },
  { aliases:["time","wonderland"],                cgId:"wonderland", type:"NON-EVM",        contract:null, chain:null },
  { aliases:["cvxcrv","convex crv"],              cgId:"convex-crv", type:"EVM",        contract:"0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7", chain:"eth" },
  { aliases:["sdcrv","stake dao crv"],            cgId:"stake-dao-crv", type:"EVM",     contract:"0xd1b5651e55d4ceed36251c61c50c889b36900000", chain:"eth" },
  { aliases:["vlcvx","vote locked cvx"],          cgId:"vote-locked-convex", type:"NON-EVM", contract:null, chain:null },
  { aliases:["stg","stargate"],                   cgId:"stargate-finance", type:"EVM",  contract:"0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6", chain:"eth" },
  { aliases:["lz","layerzero"],                   cgId:"layerzero", type:"EVM",         contract:"0x6985884c4392d348587b19cb9eaaf157f13271cd", chain:"eth" },
  { aliases:["zro","layerzero token"],            cgId:"layerzero", type:"EVM",         contract:"0x6985884c4392d348587b19cb9eaaf157f13271cd", chain:"eth" },
  { aliases:["blur"],                             cgId:"blur", type:"EVM",              contract:"0x5283d291dbcf85356a21ba090e6db59121208b44", chain:"eth" },
  { aliases:["x2y2"],                             cgId:"x2y2", type:"EVM",              contract:"0x1e4edd261e1b81c1d4f96a0e63dde59d481d5ab8", chain:"eth" },
  { aliases:["looks","looksrare"],                cgId:"looksrare", type:"EVM",         contract:"0xf4d2888d29d722226fafa5d9b24f9164c092421e", chain:"eth" },
  { aliases:["nftx"],                             cgId:"nftx", type:"EVM",              contract:"0x87d73e916d7057945c9bcd8cdd94e42a6f47f776", chain:"eth" },
  { aliases:["rare","superrare"],                 cgId:"superrare", type:"EVM",         contract:"0xba5bde662c17e2adff1075610382b9b691296350", chain:"eth" },

  // ── Oracles & Data ───────────────────────────────────────────────────────
  { aliases:["grt","the graph"],                  cgId:"the-graph", type:"EVM",         contract:"0xc944e90c64b2c07662a292be6244bdf05cda44a7", chain:"eth" },
  { aliases:["band","band protocol"],             cgId:"band-protocol", type:"EVM",     contract:"0xba11d00c5f74255f56a5e366f4f77f5a186d7f55", chain:"eth" },
  { aliases:["api3"],                             cgId:"api3", type:"EVM",              contract:"0x0b38210ea11411557c13457d4da7dc6ea731b88a", chain:"eth" },
  { aliases:["tel","telcoin"],                    cgId:"telcoin", type:"EVM",           contract:"0x467bccd9d29f223bce8043b84e8c8b282827790f", chain:"eth" },
  { aliases:["trac","origintrail"],               cgId:"origintrail", type:"EVM",       contract:"0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f", chain:"eth" },
  { aliases:["dia","dia data"],                   cgId:"dia-data", type:"EVM",          contract:"0x84ca8bc7997272c7cfb4d0cd3d55cd942b3c9419", chain:"eth" },

  // ── Infrastructure / Layer 2 ─────────────────────────────────────────────
  { aliases:["ens","ethereum name service"],      cgId:"ethereum-name-service", type:"EVM", contract:"0xc18360217d8f7ab5e7c516566761ea12ce7f9d72", chain:"eth" },
  { aliases:["imx","immutable x","immutable"],    cgId:"immutable-x", type:"EVM",       contract:"0xf57e7e7c23978c3caec3c3548e3d615c346e79ff", chain:"eth" },
  { aliases:["qnt","quant network","quant"],      cgId:"quant-network", type:"EVM",     contract:"0x4a220e6096b25eadb88358cb44068a3248254675", chain:"eth" },
  { aliases:["storj"],                            cgId:"storj", type:"EVM",             contract:"0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac", chain:"eth" },
  { aliases:["fil","filecoin"],                   cgId:"filecoin", type:"NON-EVM",          contract:null, chain:null },
  { aliases:["ankr"],                             cgId:"ankr", type:"EVM",              contract:"0x8290333cef9e6d528dd5618fb97a76f268f3edd4", chain:"eth" },
  { aliases:["lpt","livepeer"],                   cgId:"livepeer", type:"EVM",          contract:"0x58b6a8a3302369daec383334672404ee733ab239", chain:"eth" },
  { aliases:["glm","golem"],                      cgId:"golem", type:"EVM",             contract:"0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429", chain:"eth" },
  { aliases:["hot","holo","holotoken"],           cgId:"holotoken", type:"EVM",         contract:"0x6c6ee5e31d828de241282b9606c8e98ea48526e2", chain:"eth" },
  { aliases:["nmr","numeraire"],                  cgId:"numeraire", type:"EVM",         contract:"0x1776e1f26f98b1a5df9cd347953a26dd3cb46671", chain:"eth" },
  { aliases:["ren","ren protocol"],               cgId:"republic-protocol", type:"EVM", contract:"0x408e41876cccdc0f92210600ef50372656052a38", chain:"eth" },
  { aliases:["zrx","0x protocol"],               cgId:"0x", type:"EVM",                contract:"0xe41d2489571d322189246dafa5ebde1f4699f498", chain:"eth" },
  { aliases:["lrc","loopring"],                   cgId:"loopring", type:"EVM",          contract:"0xbbbbca6a901c926f240b89eacb641d8aec7aeafd", chain:"eth" },
  { aliases:["skl","skale"],                      cgId:"skale", type:"EVM",             contract:"0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7", chain:"eth" },
  { aliases:["stx","stacks"],                     cgId:"blockstack", type:"NON-EVM",        contract:null, chain:null },
  { aliases:["iota"],                             cgId:"iota", type:"NON-EVM",              contract:null, chain:null },
  { aliases:["gtc","gitcoin"],                    cgId:"gitcoin", type:"EVM",           contract:"0xde30da39c46104798bb5aa3fe8b9e0e1f348163f", chain:"eth" },
  { aliases:["ctsi","cartesi"],                   cgId:"cartesi", type:"EVM",           contract:"0x491604c0fdf08347dd1fa4ee062a822a5dd06b5d", chain:"eth" },
  { aliases:["celr","celer network"],             cgId:"celer-network", type:"EVM",     contract:"0x4f9254c83eb525f9fcf346490bbb3ed28a81c667", chain:"eth" },
  { aliases:["mask","mask network"],              cgId:"mask-network", type:"EVM",      contract:"0x69af81e73a73b40adf4f3d4223cd9b1ece623074", chain:"eth" },
  { aliases:["nu","nucypher"],                    cgId:"nucypher", type:"EVM",          contract:"0x4fe83213d56308330ec302a8bd641f1d0113a4cc", chain:"eth" },
  { aliases:["nkn"],                              cgId:"nkn", type:"EVM",               contract:"0x5cf04716ba20127f1e2297addcf4b5035000c9eb", chain:"eth" },
  { aliases:["bat","basic attention token"],      cgId:"basic-attention-token", type:"EVM", contract:"0x0d8775f648430679a709e98d2b0cb6250d2887ef", chain:"eth" },
  { aliases:["mdt","measurable data token"],      cgId:"measurable-data-token", type:"EVM", contract:"0x814e0908b12a99fecf5bc101bb5d0b8b5cdf7d26", chain:"eth" },
  { aliases:["ocean","ocean protocol"],           cgId:"ocean-protocol", type:"EVM",    contract:"0x967da4048cd07ab37855c090aaf366e4ce1b9f48", chain:"eth" },
  { aliases:["fet","fetch.ai","fetchai"],         cgId:"fetch-ai", type:"EVM",          contract:"0xaea46a60368a7bd060eec7df8cba43b7ef41ad85", chain:"eth" },
  { aliases:["agix","singularitynet"],            cgId:"singularitynet", type:"EVM",    contract:"0x5b7533812759b45c2b44c19e320ba2cd2681b542", chain:"eth" },
  { aliases:["agi","singularity net"],            cgId:"singularitynet", type:"EVM",    contract:"0x5b7533812759b45c2b44c19e320ba2cd2681b542", chain:"eth" },
  { aliases:["fet","asi"],                        cgId:"fetch-ai", type:"EVM",          contract:"0xaea46a60368a7bd060eec7df8cba43b7ef41ad85", chain:"eth" },

  // ── Gaming / NFT / Metaverse ─────────────────────────────────────────────
  { aliases:["ape","apecoin"],                    cgId:"apecoin", type:"EVM",           contract:"0x4d224452801aced8b2f0aebe155379bb5d594381", chain:"eth" },
  { aliases:["sand","the sandbox","sandbox"],     cgId:"the-sandbox", type:"EVM",       contract:"0x3845badade8e6dff049820680d1f14bd3903a5d0", chain:"eth" },
  { aliases:["mana","decentraland"],              cgId:"decentraland", type:"EVM",      contract:"0x0f5d2fb29fb7d3cfee444a200298f468908cc942", chain:"eth" },
  { aliases:["axs","axie infinity"],              cgId:"axie-infinity", type:"EVM",     contract:"0xbb0e17ef65f82ab018d8edd776e8dd940327b28b", chain:"eth" },
  { aliases:["gala"],                             cgId:"gala", type:"EVM",              contract:"0xd1d2eb1b1e90b638588728b4130137d262c87cae", chain:"eth" },
  { aliases:["enj","enjin","enjin coin"],         cgId:"enjincoin", type:"EVM",         contract:"0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c", chain:"eth" },
  { aliases:["chz","chiliz"],                     cgId:"chiliz", type:"EVM",            contract:"0x3506424f91fd33084466f402d5d97f05f8e3b4af", chain:"eth" },
  { aliases:["ilv","illuvium"],                   cgId:"illuvium", type:"EVM",          contract:"0x767fe9edc9e0df98e07454847909b5e959d7ca0e", chain:"eth" },
  { aliases:["ygg","yield guild games"],          cgId:"yield-guild-games", type:"EVM", contract:"0x25f8087ead173b73d6e8b84329989a8eea16cf73", chain:"eth" },
  { aliases:["mc","merit circle"],                cgId:"merit-circle", type:"EVM",      contract:"0x949d48eca67b17269629c7194f4b727d4ef9e5d6", chain:"eth" },
  { aliases:["mog","mog coin"],                   cgId:"mog-coin", type:"EVM",          contract:"0xaaee1a9723aadb7afa2810263653a34ba2c21c7a", chain:"eth" },
  { aliases:["jasmy","jasmycoin"],                cgId:"jasmycoin", type:"EVM",         contract:"0x7420b4b9a0110cdc71fb720908340c03f9bc03ec", chain:"eth" },
  { aliases:["gmt","stepn","green metaverse token"], cgId:"stepn", type:"EVM",          contract:"0xe3c408bd53c31c085a1746af401a4042954ff740", chain:"eth" },
  { aliases:["slp","smooth love potion"],         cgId:"smooth-love-potion", type:"EVM", contract:"0xcc8fa225d80b9c7d42f96e9570156c65d6caaa25", chain:"eth" },
  { aliases:["waxp","wax"],                       cgId:"wax", type:"NON-EVM",               contract:null, chain:null },
  { aliases:["flow"],                             cgId:"flow", type:"NON-EVM",              contract:null, chain:null },
  { aliases:["theta","theta token"],              cgId:"theta-token", type:"NON-EVM",       contract:null, chain:null },
  { aliases:["tfuel","theta fuel"],               cgId:"theta-fuel", type:"NON-EVM",        contract:null, chain:null },
  { aliases:["hbar","hedera"],                    cgId:"hedera-hashgraph", type:"NON-EVM",  contract:null, chain:null },
  { aliases:["vet","vechain"],                    cgId:"vechain", type:"NON-EVM",           contract:null, chain:null },
  { aliases:["vtho","vechain thor"],              cgId:"vethor-token", type:"EVM",      contract:"0x37db0d8c816c57b2adf61f28c540a8a46e2ea67d", chain:"eth" },
  { aliases:["pixel","pixels"],                   cgId:"pixels", type:"EVM",            contract:"0x3429d03c6f7521aec737a0bbf2e5ddcef2c3ae31", chain:"eth" },
  { aliases:["portal","portal gaming"],           cgId:"portal-gaming", type:"EVM",     contract:"0x1bbe973bef3a977fc51cbfe7c67c25c09af2d0d2", chain:"eth" },
  { aliases:["mavia","heroes of mavia"],          cgId:"heroes-of-mavia", type:"EVM",   contract:"0x7ca5af5ba3472af6049f63c1abb42106188f8c78", chain:"eth" },
  { aliases:["prime","echelon prime"],            cgId:"echelon-prime", type:"EVM",     contract:"0xb23d80f5fefcddaa212212f028021b41ded428cf", chain:"eth" },
  { aliases:["wild","wilder world"],              cgId:"wilder-world", type:"EVM",      contract:"0x2a3bff78b79a009976eea096a51a948a3dc00e34", chain:"eth" },
  { aliases:["atlas","star atlas"],               cgId:"star-atlas", type:"NON-EVM",        contract:null, chain:null },
  { aliases:["polis","star atlas polis"],         cgId:"star-atlas-polis", type:"NON-EVM",  contract:null, chain:null },

  // ── AI / Compute tokens ──────────────────────────────────────────────────
  { aliases:["render","rndr","render token"],     cgId:"render-token", type:"NON-EVM",  contract:null, chain:null },
  { aliases:["wld","worldcoin"],                  cgId:"worldcoin-wld", type:"EVM",     contract:"0x163f8c2467924be0ae7b5347228cabf260318753", chain:"eth" },
  { aliases:["tao","bittensor"],                  cgId:"bittensor", type:"NON-EVM",         contract:null, chain:null },
  { aliases:["gensyn"],                           cgId:"gensyn", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["akash","akt","akash network"],      cgId:"akash-network", type:"NON-EVM",     contract:null, chain:null },
  { aliases:["io","io.net"],                      cgId:"io-net", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["olas","autonolas"],                 cgId:"autonolas", type:"EVM",         contract:"0x0001a500a6b18995b03f44bb040a5ffc28e45cb0", chain:"eth" },

  // ── RWA / Institutional ──────────────────────────────────────────────────
  { aliases:["pol","polygon ecosystem token"],    cgId:"matic-network", type:"EVM",     contract:"0x455e53cbb86018ac2b8092fdcd39d8444affc3a6", chain:"eth" },
  { aliases:["matic","polygon","polygon matic"],  cgId:"matic-network", type:"EVM",     contract:"0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", chain:"eth" },
  { aliases:["gns","gains network"],              cgId:"gains-network", type:"EVM",     contract:"0x18c11fd286c5ec11c3b683caa813b77f5163a122", chain:"eth" },
  { aliases:["pendle"],                           cgId:"pendle", type:"EVM",            contract:"0x808507121b80c02388fad14726482e061b8da827", chain:"eth" },

  // ── Meme coins ──────────────────────────────────────────────────────────
  { aliases:["shib","shiba inu"],                 cgId:"shiba-inu", type:"EVM",         contract:"0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce", chain:"eth" },
  { aliases:["pepe"],                             cgId:"pepe", type:"EVM",              contract:"0x6982508145454ce325ddbe47a25d4ec3d2311933", chain:"eth" },
  { aliases:["floki"],                            cgId:"floki", type:"NON-EVM",         contract:null, chain:null },
  { aliases:["bone","bone shibaswap"],            cgId:"bone-shibaswap", type:"EVM",    contract:"0x9813037ee2218799597d83d4a5b6f3b6778218d9", chain:"eth" },
  { aliases:["leash","doge killer"],              cgId:"doge-killer", type:"EVM",       contract:"0x27c70cd1946795b66be9d954418546998b546634", chain:"eth" },
  { aliases:["elon","dogelon mars"],              cgId:"dogelon-mars", type:"EVM",      contract:"0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3", chain:"eth" },
  { aliases:["kishu","kishu inu"],                cgId:"kishu-inu", type:"EVM",         contract:"0xa2b4c0af19cc16a6cfacce81f192b024d625817d", chain:"eth" },
  { aliases:["volt","volt inu"],                  cgId:"volt-inu-v2", type:"EVM",       contract:"0x3e5d9d8a63cc8a88748f229999cf59487e90721e", chain:"eth" },
  { aliases:["samo","samoyedcoin"],               cgId:"samoyedcoin", type:"NON-EVM",       contract:null, chain:null },
  { aliases:["cheems"],                           cgId:"cheems", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["babydoge","baby doge coin"],        cgId:"baby-doge-coin", type:"NON-EVM",    contract:null, chain:null },

  // ── Other notable ETH tokens ─────────────────────────────────────────────
  { aliases:["frax"],                             cgId:"frax", type:"EVM",              contract:"0x853d955acef822db058eb8505911ed77f175b99e", chain:"eth" },
  { aliases:["crv"],                              cgId:"curve-dao-token", type:"EVM",   contract:"0xd533a949740bb3306d119cc777fa900ba034cd52", chain:"eth" },
  { aliases:["cvx"],                              cgId:"convex-finance", type:"EVM",    contract:"0x4e3fbd56cd56c3e72c1403e109b45db9da5b9d2b", chain:"eth" },
  { aliases:["alt","altlayer"],                   cgId:"altlayer", type:"EVM",          contract:"0x8457ca5040ad67fdebbcc8edce889a335bc0fbfb", chain:"eth" },
  { aliases:["manta","manta network"],            cgId:"manta-network", type:"EVM",     contract:"0x95cef13441be50d20ca4558cc0a27b601ac544e5", chain:"eth" },
  { aliases:["blast"],                            cgId:"blast", type:"EVM",             contract:"0x87056f5e8a2126ba72a11f99ca02e3e3bde04ab7", chain:"eth" },
  { aliases:["metis","metis token"],              cgId:"metis-token", type:"EVM",       contract:"0x9e32b13ce7f2e80a01932b42553652e053d6ed8e", chain:"eth" },
  { aliases:["ftm","fantom"],                     cgId:"fantom", type:"EVM",            contract:"0x4e15361fd6b4bb609fa63c81a2be19d873717870", chain:"eth" },
  { aliases:["rseth"],                            cgId:"kelp-dao-restaked-eth", type:"EVM", contract:"0xa1290d69c65a6fe4df752f95823fae25cb99e5a7", chain:"eth" },
  { aliases:["usdy"],                             cgId:"ondo-us-dollar-yield", type:"EVM", contract:"0x96f6ef951840721adbf46ac996b59e0235cb985c", chain:"eth" },
  { aliases:["bgb"],                              cgId:"bitget-token", type:"EVM",      contract:"0x19de6b897ed14a376dda0fe53a5420d2ac828a28", chain:"eth" },

  // ══════════════════════════════════════════════════════════════════════════
  // BSC — BEP-20 (chain: "bsc")
  // ══════════════════════════════════════════════════════════════════════════
  { aliases:["cake","pancakeswap"],               cgId:"pancakeswap-token", type:"EVM", contract:"0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", chain:"bsc" },
  { aliases:["xvs","venus"],                      cgId:"venus", type:"EVM",             contract:"0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63", chain:"bsc" },
  { aliases:["bake","bakeryswap"],                cgId:"bakerytoken", type:"NON-EVM",   contract:null, chain:null },
  { aliases:["alpaca","alpaca finance"],          cgId:"alpaca-finance", type:"EVM",    contract:"0x8f0528ce5ef7b51152a59745befdd91d97091d2f", chain:"bsc" },
  { aliases:["the","the tokenized equity"],       cgId:"the-tokenized-equity", type:"EVM", contract:"0xf4c8e32eadec4bfe97e0f595add0f4450a863a5", chain:"bsc" },
  { aliases:["raca","radio caca"],                cgId:"radio-caca", type:"EVM",        contract:"0x12bb890508c125661e03b09ec06e404bc9289040", chain:"bsc" },
  { aliases:["sfp","safepal"],                    cgId:"safepal", type:"EVM",           contract:"0xd41fdb03ba84762dd66a0af1a6c8540ff1ba5dfb", chain:"bsc" },
  { aliases:["pancake","syrup"],                  cgId:"pancakeswap-token", type:"EVM", contract:"0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", chain:"bsc" },
  { aliases:["vai"],                              cgId:"vai", type:"EVM",               contract:"0x4bd17003473389a42daf6a0a729f6fdb328bbbd7", chain:"bsc" },
  { aliases:["epx","ellipsis x"],                 cgId:"ellipsis-x", type:"EVM",        contract:"0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71", chain:"bsc" },
  { aliases:["eps","ellipsis"],                   cgId:"ellipsis", type:"EVM",          contract:"0xa7f552078dcc247c2684336020c03648500c6d9f", chain:"bsc" },
  { aliases:["hay","helio protocol"],             cgId:"helio-protocol", type:"EVM",    contract:"0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5", chain:"bsc" },
  { aliases:["bnbx","stader bnbx"],               cgId:"bnbx", type:"EVM",              contract:"0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275", chain:"bsc" },
  { aliases:["snbnb","synclub bnb"],              cgId:"synclub-bnb", type:"EVM",       contract:"0xb0b84d294e0c75a6abe60171b70edeb2efd14a1b", chain:"bsc" },
  { aliases:["bscx","bscex"],                     cgId:"bscex", type:"EVM",             contract:"0x5ac52ee5b2a633895292ff6d8a89bb9190451587", chain:"bsc" },
  { aliases:["bxy","bexy"],                       cgId:"bexy", type:"EVM",              contract:"0x7614aace6f71274386a5d1d9e26b4b3a1a5efee2", chain:"bsc" },
  { aliases:["dnt","district0x"],                 cgId:"district0x", type:"EVM",        contract:"0xed91879919b71bb6905f23af0a68d231ecf87b14", chain:"bsc" },

  // ══════════════════════════════════════════════════════════════════════════
  // ARBITRUM (chain: "arbitrum")
  // ══════════════════════════════════════════════════════════════════════════
  { aliases:["arb","arbitrum"],                   cgId:"arbitrum", type:"EVM",          contract:"0x912ce59144191c1204e64559fe8253a0e49e6548", chain:"arbitrum" },
  { aliases:["gmx"],                              cgId:"gmx", type:"EVM",               contract:"0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a", chain:"arbitrum" },
  { aliases:["magic"],                            cgId:"magic", type:"EVM",             contract:"0x539bde0d7dbd336b79148aa742883198bbf60342", chain:"arbitrum" },
  { aliases:["rdnt","radiant","radiant capital"],  cgId:"radiant-capital", type:"EVM",   contract:"0x3082cc23568ea640225c2467653db90e9250aaa0", chain:"arbitrum" },
  { aliases:["dpx","dopex"],                      cgId:"dopex", type:"EVM",             contract:"0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55", chain:"arbitrum" },
  { aliases:["jones","jones dao"],                cgId:"jones-dao", type:"EVM",         contract:"0x10393c20975cf177a3513071bc110f7962cd67da", chain:"arbitrum" },
  { aliases:["grail","camelot dex"],              cgId:"camelot-token", type:"EVM",     contract:"0x3d9907f9a368ad0a51be60f7da3b97cf940982d8", chain:"arbitrum" },
  { aliases:["pendle"],                           cgId:"pendle", type:"EVM",            contract:"0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8", chain:"arbitrum" },
  { aliases:["stg","stargate finance"],           cgId:"stargate-finance", type:"EVM",  contract:"0x6694340fc020c5e6b96567843da2df01b2ce1eb6", chain:"arbitrum" },
  { aliases:["cap","cap finance"],                cgId:"cap", type:"EVM",               contract:"0x031d35296154279dc1984dcd93e392b1f946737b", chain:"arbitrum" },
  { aliases:["vsta","vesta finance"],             cgId:"vesta-finance", type:"EVM",     contract:"0xa684cd057951541187f288294a1e1c2646aa2d24", chain:"arbitrum" },
  { aliases:["myc","mycelium"],                   cgId:"mycelium", type:"EVM",          contract:"0xc74fe4c715510ec2f8c61d70d397b32043f55abe", chain:"arbitrum" },
  { aliases:["hzn","horizon"],                    cgId:"horizon-protocol", type:"NON-EVM",  contract:null, chain:null },

  // ══════════════════════════════════════════════════════════════════════════
  // BASE (chain: "base")
  // ══════════════════════════════════════════════════════════════════════════
  { aliases:["aero","aerodrome"],                 cgId:"aerodrome-finance", type:"EVM", contract:"0x940181a94a35a4569e4529a3cdfb74e38fd98631", chain:"base" },
  { aliases:["bsdeth","based eth"],               cgId:"based-eth", type:"EVM",         contract:"0xeb466342c4d449bc9f53a865d5cb90586f405215", chain:"base" },
  { aliases:["cbbtc"],                            cgId:"coinbase-wrapped-btc", type:"EVM", contract:"0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf", chain:"base" },
  { aliases:["brett","brett meme"],               cgId:"brett", type:"EVM",             contract:"0x532f27101965dd16442e59d40670faf5ebb142e4", chain:"base" },
  { aliases:["toshi"],                            cgId:"toshi", type:"EVM",             contract:"0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4", chain:"base" },
  { aliases:["mochi","mochi inu"],                cgId:"mochi-inu", type:"EVM",         contract:"0x47ef4a5641992a72cfd57b9406c9d9cefee8e0c4", chain:"base" },
  { aliases:["degen","degen base"],               cgId:"degen-base", type:"EVM",        contract:"0x4ed4e862860bed51a9570b96d89af5e1b0efefed", chain:"base" },
  { aliases:["higher"],                           cgId:"higher", type:"EVM",            contract:"0x0578d8a44db98b23bf096a382e016e29a5ce0ffe", chain:"base" },
  { aliases:["normie"],                           cgId:"normie", type:"EVM",            contract:"0x7f12d13b34f5f4f0a9449c89bcf0cf169b9f4e6e", chain:"base" },

  // ══════════════════════════════════════════════════════════════════════════
  // OPTIMISM (chain: "optimism")
  // ══════════════════════════════════════════════════════════════════════════
  { aliases:["op","optimism"],                    cgId:"optimism", type:"EVM",          contract:"0x4200000000000000000000000000000000000042", chain:"optimism" },
  { aliases:["velo","velodrome"],                 cgId:"velodrome-finance", type:"EVM", contract:"0x9560e827af36c94d2ac33a39bce1fe78631088db", chain:"optimism" },
  { aliases:["sonne"],                            cgId:"sonne-finance", type:"EVM",     contract:"0x1db2466d9f5e10d7090e7152b68d62703a2245f0", chain:"optimism" },
  { aliases:["bifi","beefy finance"],             cgId:"beefy-finance", type:"EVM",     contract:"0x4e720dd3ac5cfe1e1fbde4935f386bb1c66f4642", chain:"optimism" },
  { aliases:["perp"],                             cgId:"perpetual-protocol", type:"EVM", contract:"0x9e1028f5f1d5ede59748ffcee5532509976840e0", chain:"optimism" },
  { aliases:["lyra"],                             cgId:"lyra-finance", type:"EVM",      contract:"0x50c5725949a6f0c72e6c4a641f24049a917db0cb", chain:"optimism" },
  { aliases:["kwenta"],                           cgId:"kwenta", type:"EVM",            contract:"0x920cf626a271321c151d027030d5d08af699456b", chain:"optimism" },

  // ══════════════════════════════════════════════════════════════════════════
  // POLYGON (chain: "polygon")
  // ══════════════════════════════════════════════════════════════════════════
  { aliases:["quick","quickswap"],                cgId:"quickswap", type:"EVM",         contract:"0xb5c064f955d8e7f38fe0460c556a72987494ee17", chain:"polygon" },
  { aliases:["dfyn","dfyn network"],              cgId:"dfyn-network", type:"EVM",      contract:"0xc168e40227e4ebd8c1cae80f7a55a4f0e6d66c97", chain:"polygon" },
  { aliases:["ghst","aavegotchi"],                cgId:"aavegotchi", type:"EVM",        contract:"0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7", chain:"polygon" },
  { aliases:["maticx","stader polygon"],          cgId:"stader-maticx", type:"EVM",     contract:"0xfa68fb4628dff1028cfec22b4162fccd0d45efb6", chain:"polygon" },
  { aliases:["stmatic","lido staked matic"],      cgId:"lido-staked-matic", type:"EVM", contract:"0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4", chain:"polygon" },

  // ══════════════════════════════════════════════════════════════════════════
  // AVALANCHE (chain: "avalanche")
  // ══════════════════════════════════════════════════════════════════════════
  { aliases:["joe","trader joe"],                 cgId:"joe", type:"EVM",               contract:"0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd", chain:"avalanche" },
  { aliases:["png","pangolin"],                   cgId:"pangolin", type:"EVM",          contract:"0x60781c2586d68229fde47564546784ab3faca982", chain:"avalanche" },
  { aliases:["qi","benqi"],                       cgId:"benqi", type:"EVM",             contract:"0x8729438eb15e2c8b576fcc6aecda6a148776c0f5", chain:"avalanche" },
  { aliases:["time","wonderland avax"],           cgId:"wonderland", type:"EVM",        contract:"0xb54f16fb19478766a268f172c9480f8da1a7c9c3", chain:"avalanche" },
  { aliases:["sAvax","benqi liquid avax"],        cgId:"benqi-liquid-staked-avax", type:"EVM", contract:"0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", chain:"avalanche" },
  { aliases:["gmx avax"],                         cgId:"gmx", type:"EVM",               contract:"0x62edc0692bd897d2295872a9ffcac5425011c661", chain:"avalanche" },

  // ══════════════════════════════════════════════════════════════════════════
  // FANTOM (chain: "fantom")
  // ══════════════════════════════════════════════════════════════════════════
  { aliases:["spirit","spiritswap"],              cgId:"spiritswap", type:"EVM",        contract:"0x5cc61a78f164885776aa610fb0fe1257df78e59b", chain:"fantom" },
  { aliases:["spell fantom"],                     cgId:"spell-token", type:"EVM",       contract:"0x468003b688943977e6130f4f68f23aad939a1040", chain:"fantom" },
  { aliases:["boo","spookyswap"],                 cgId:"spookyswap", type:"EVM",        contract:"0x841fad6eae12c286d1fd18d1d525dffa75c7effe", chain:"fantom" },
  { aliases:["scream"],                           cgId:"scream", type:"EVM",            contract:"0xe0654c8e6fd4d733349ac7813098526cd02c7ab1", chain:"fantom" },

  // ══════════════════════════════════════════════════════════════════════════
  // NATIVE NON-EVM (contract: null, chain: null)
  // ══════════════════════════════════════════════════════════════════════════
  // These are routed to dedicated per-chain fetchers in analyze.js
  { aliases:["sol","solana"],                     cgId:"solana", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["bnb native","binance chain bnb"],   cgId:"binancecoin", type:"NON-EVM",       contract:null, chain:null },
  { aliases:["xrp","ripple"],                     cgId:"ripple", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["doge","dogecoin"],                  cgId:"dogecoin", type:"NON-EVM",          contract:null, chain:null },
  { aliases:["ada","cardano"],                    cgId:"cardano", type:"NON-EVM",           contract:null, chain:null },
  { aliases:["trx","tron"],                       cgId:"tron", type:"NON-EVM",              contract:null, chain:null },
  { aliases:["dot","polkadot"],                   cgId:"polkadot", type:"NON-EVM",          contract:null, chain:null },
  { aliases:["avax","avalanche native"],          cgId:"avalanche-2", type:"NON-EVM",       contract:null, chain:null },
  { aliases:["atom","cosmos"],                    cgId:"cosmos", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["near"],                             cgId:"near", type:"NON-EVM",              contract:null, chain:null },
  { aliases:["apt","aptos"],                      cgId:"aptos", type:"NON-EVM",             contract:null, chain:null },
  { aliases:["sui"],                              cgId:"sui", type:"NON-EVM",               contract:null, chain:null },
  { aliases:["hype","hyperliquid"],               cgId:"hyperliquid", type:"NON-EVM",       contract:null, chain:null },
  { aliases:["ltc","litecoin"],                   cgId:"litecoin", type:"NON-EVM",          contract:null, chain:null },
  { aliases:["bch","bitcoin cash"],               cgId:"bitcoin-cash", type:"NON-EVM",      contract:null, chain:null },
  { aliases:["xlm","stellar","stellar lumens"],   cgId:"stellar", type:"NON-EVM",           contract:null, chain:null },
  { aliases:["algo","algorand"],                  cgId:"algorand", type:"NON-EVM",          contract:null, chain:null },
  { aliases:["ton","toncoin"],                    cgId:"the-open-network", type:"NON-EVM",  contract:null, chain:null },
  { aliases:["icp","internet computer"],          cgId:"internet-computer", type:"NON-EVM", contract:null, chain:null },
  { aliases:["egld","multiversx"],                cgId:"elrond-erd-2", type:"NON-EVM",      contract:null, chain:null },
  { aliases:["xtz","tezos"],                      cgId:"tezos", type:"NON-EVM",             contract:null, chain:null },
  { aliases:["eos"],                              cgId:"eos", type:"NON-EVM",               contract:null, chain:null },
  { aliases:["zec","zcash"],                      cgId:"zcash", type:"NON-EVM",             contract:null, chain:null },
  { aliases:["dash"],                             cgId:"dash", type:"NON-EVM",              contract:null, chain:null },
  { aliases:["dcr","decred"],                     cgId:"decred", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["xmr","monero"],                     cgId:"monero", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["ksm","kusama"],                     cgId:"kusama", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["one","harmony"],                    cgId:"harmony", type:"NON-EVM",           contract:null, chain:null },
  { aliases:["icx","icon"],                       cgId:"icon", type:"NON-EVM",              contract:null, chain:null },
  { aliases:["zil","zilliqa"],                    cgId:"zilliqa", type:"NON-EVM",           contract:null, chain:null },
  { aliases:["ont","ontology"],                   cgId:"ontology", type:"NON-EVM",          contract:null, chain:null },
  { aliases:["waves"],                            cgId:"waves", type:"NON-EVM",             contract:null, chain:null },
  { aliases:["kava"],                             cgId:"kava", type:"NON-EVM",              contract:null, chain:null },
  { aliases:["luna","terra luna"],                cgId:"terra-luna-2", type:"NON-EVM",      contract:null, chain:null },
  { aliases:["lunc","terra luna classic"],        cgId:"terra-luna", type:"NON-EVM",        contract:null, chain:null },
  { aliases:["ust","terrausd"],                   cgId:"terrausd", type:"NON-EVM",          contract:null, chain:null },
  { aliases:["osmo","osmosis"],                   cgId:"osmosis", type:"NON-EVM",           contract:null, chain:null },
  { aliases:["scrt","secret"],                    cgId:"secret", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["juno"],                             cgId:"juno-network", type:"NON-EVM",      contract:null, chain:null },
  { aliases:["evmos"],                            cgId:"evmos", type:"NON-EVM",             contract:null, chain:null },
  { aliases:["inj","injective"],                  cgId:"injective-protocol", type:"NON-EVM", contract:null, chain:null },
  { aliases:["sei"],                              cgId:"sei-network", type:"NON-EVM",       contract:null, chain:null },
  { aliases:["celestia","tia"],                   cgId:"celestia", type:"NON-EVM",          contract:null, chain:null },
  { aliases:["dym","dymension"],                  cgId:"dymension", type:"NON-EVM",         contract:null, chain:null },
  { aliases:["atom2","cosmos2"],                  cgId:"cosmos", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["strd","stride"],                    cgId:"stride", type:"NON-EVM",            contract:null, chain:null },
  { aliases:["rowan","sifchain"],                 cgId:"sifchain", type:"NON-EVM",          contract:null, chain:null },

  // ── Solana tokens — NON-EVM (unsupported) ───────────────────────────────
  { aliases:["bonk"],                               cgId:"bonk",              type:"NON-EVM", contract:null, chain:null },
  { aliases:["wif","dogwifhat"],                    cgId:"dogwifcoin",        type:"NON-EVM", contract:null, chain:null },
  { aliases:["jup","jupiter"],                      cgId:"jupiter-exchange-solana", type:"NON-EVM", contract:null, chain:null },
  { aliases:["pyth"],                               cgId:"pyth-network",      type:"NON-EVM", contract:null, chain:null },
  { aliases:["nos","nosana"],                       cgId:"nosana",            type:"NON-EVM", contract:null, chain:null },
  { aliases:["cloud","cloudmos"],                   cgId:"cloudmos",          type:"NON-EVM", contract:null, chain:null },
  { aliases:["ray","raydium"],                      cgId:"raydium",           type:"NON-EVM", contract:null, chain:null },
  { aliases:["orca"],                               cgId:"orca",              type:"NON-EVM", contract:null, chain:null },
  { aliases:["mngo","mango markets"],               cgId:"mango-markets",     type:"NON-EVM", contract:null, chain:null },
  { aliases:["samo","samoyedcoin"],                 cgId:"samoyedcoin",       type:"NON-EVM", contract:null, chain:null },
  { aliases:["popcat"],                             cgId:"popcat",            type:"NON-EVM", contract:null, chain:null },
  { aliases:["fida","bonfida"],                     cgId:"bonfida",           type:"NON-EVM", contract:null, chain:null },

  // ── BNB Chain tokens — NON-EVM (unsupported) ────────────────────────────
  { aliases:["twt","trust wallet token"],           cgId:"trust-wallet-token",type:"NON-EVM", contract:null, chain:null },
  { aliases:["bsw","biswap"],                       cgId:"biswap",            type:"NON-EVM", contract:null, chain:null },
  { aliases:["nuls"],                               cgId:"nuls",              type:"NON-EVM", contract:null, chain:null },


];

// ─────────────────────────────────────────────────────────────────────────────
// BUILD LOOKUP INDEX — O(1) alias → entry lookups at runtime
// This runs once when the module is first imported.
// ─────────────────────────────────────────────────────────────────────────────
const _index = new Map();
for (const entry of COINS) {
  for (const alias of entry.aliases) {
    const key = alias.toLowerCase().trim();
    if (!_index.has(key)) _index.set(key, entry); // first entry wins on collision
  }
}

/**
 * lookup(query) — find a coin entry by ticker, name, or alias.
 * Returns the entry object or undefined if not found.
 *
 * @param {string} query — e.g. "ETH", "chainlink", "PEPE"
 * @returns {{ aliases, cgId, type, contract, chain } | undefined}
 */
export function lookup(query) {
  return _index.get(query.toLowerCase().trim());
}

/**
 * addCoin(entry) — add a new coin at runtime without redeploying.
 * Useful for testing or dynamic updates.
 *
 * @param {{ aliases: string[], cgId: string, type: string, contract: string|null, chain: string|null }} entry
 */
export function addCoin(entry) {
  COINS.push(entry);
  for (const alias of entry.aliases) {
    const key = alias.toLowerCase().trim();
    if (!_index.has(key)) _index.set(key, entry);
  }
}

export const size = () => _index.size;
