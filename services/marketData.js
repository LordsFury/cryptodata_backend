import axios from "axios";
import { setCoinData, getCoinData } from "../cache/dataStore.js";
import CoinModel from "../models/CoinModel.js";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Fetch one page (250 items) from CoinGecko Markets API
 */
async function fetchPage(page, retries = 3, delay = 5000) {
  try {
    console.log(`📄 Fetching page ${page}...`);
    const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        per_page: 250,
        page,
        price_change_percentage: "1h,24h,7d,30d,1y",
        locale: "en",
      },
      timeout: 30000,
    });
    return res.data || [];
  } catch (err) {
    const status = err?.response?.status;
    if (status === 429 && retries > 0) {
      console.warn(
        `⏳ Rate-limited (429). Waiting ${delay / 1000}s before retry (page ${page}, retries left ${retries})...`
      );
      await sleep(delay);
      return fetchPage(page, retries - 1, delay * 2);
    }
    console.error(`❌ fetchPage(${page}) failed:`, err.message || err);
    return [];
  }
}

/**
 * Normalize a coin object from API → standard schema for DB + cache
 */
function normalizeCoinFromAPI(apiCoin) {
  return {
    id: apiCoin.id,
    symbol: (apiCoin.symbol || "").toUpperCase(),
    name: apiCoin.name || null,
    image: apiCoin.image || null,
    market_cap: apiCoin.market_cap != null ? apiCoin.market_cap : null,
    volume: apiCoin.total_volume != null ? apiCoin.total_volume : null,
    rank: apiCoin.market_cap_rank != null ? Number(apiCoin.market_cap_rank) : null,
    price: apiCoin.current_price != null ? Number(apiCoin.current_price) : null,
    percent_change_24h: apiCoin.price_change_percentage_24h ?? null,
    percent_change_7d:
      apiCoin.price_change_percentage_7d_in_currency ??
      apiCoin.price_change_percentage_7d ??
      null,
    percent_change_1h:
      apiCoin.price_change_percentage_1h_in_currency ??
      apiCoin.price_change_percentage_1h ??
      null,
    percent_change_30d:
      apiCoin.price_change_percentage_30d_in_currency ??
      apiCoin.price_change_percentage_30d ??
      null,
    percent_change_1y:
      apiCoin.price_change_percentage_1y_in_currency ??
      apiCoin.price_change_percentage_1y ??
      null,
    last_updated: apiCoin.last_updated ?? null,
  };
}

/**
 * Fetch & Update Market Data (cache + DB)
 */
export async function updateMarketCaps() {
  console.log("🟡 Fetching CoinGecko market data (up to 1000 coins)...");
  const allCoins = [];
  const totalPages = 4; // 4x250 = 1000

  for (let page = 1; page <= totalPages; page++) {
    const data = await fetchPage(page);
    if (Array.isArray(data) && data.length > 0) {
      allCoins.push(...data);
      console.log(`✅ Page ${page} fetched: ${data.length} coins`);
    } else {
      console.warn(`⚠️ Page ${page} returned no data.`);
    }
    await sleep(2000); // avoid rate limit
  }

  // De-duplicate by `id` to avoid missing/misplaced coins
  const uniqueMap = new Map();
  for (const c of allCoins) {
    if (!uniqueMap.has(c.id)) uniqueMap.set(c.id, c);
  }

  const validCoins = Array.from(uniqueMap.values()).map(normalizeCoinFromAPI);

  // Sanity checks
  console.log(`📊 Total fetched: ${allCoins.length}, unique: ${validCoins.length}`);

  // Update in-memory cache
  validCoins.forEach((coin) => setCoinData(coin.id, coin));

  // Bulk upsert to DB
  if (validCoins.length > 0) {
    const bulkOps = validCoins.map((coin) => ({
      updateOne: {
        filter: { id: coin.id },
        update: { $set: coin },
        upsert: true,
      },
    }));

    try {
      const result = await CoinModel.bulkWrite(bulkOps, { ordered: false });
      console.log(
        `💾 DB Updated — Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`
      );
    } catch (err) {
      console.error("❌ DB bulkWrite failed:", err.message);
    }
  }

  console.log(`✅ Cache updated with ${Object.keys(getCoinData()).length} coins.`);
}

/**
 * Initialize cache from DB on startup
 */
export async function initData() {
  try {
    const count = await CoinModel.countDocuments();
    if (count === 0) {
      console.log("📥 No data in DB — fetching initial market data...");
      await updateMarketCaps();
    } else {
      console.log(`📦 Loading ${count} coins from DB into cache...`);
      const coins = await CoinModel.find().lean();
      coins.forEach((coin) =>
        setCoinData((coin.id || "").toUpperCase(), coin)
      );
      console.log("✅ DataStore initialized from DB");
    }
  } catch (err) {
    console.error("❌ initData failed:", err.message);
  }
}
