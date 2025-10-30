import axios from "axios";
import { setCoinData } from "../cache/dataStore.js";

const EXCLUDED_SYMBOLS = [
  "STETH", "WSTETH", "WETH", "WBTC", "BTCB", "SUSDE", "WEETH", "WLFI"
];


export async function updateMarketCaps() {
  try {
    const res = await axios.get("https://api.coinranking.com/v2/coins?limit=100");
    const coins = res.data.data.coins.filter((coin) => !EXCLUDED_SYMBOLS.includes(coin.symbol.toUpperCase()));
    
    coins.forEach((coin) => {
      setCoinData(coin.symbol.toUpperCase(), {
        id:coin.uuid,
        symbol: coin.symbol.toUpperCase(),
        market_cap: parseFloat(coin.marketCap),
        price: parseFloat(coin.price),
        percent_change_24h: parseFloat(coin.change),
        rank: coin.rank,
        volume: parseFloat(coin["24hVolume"]),
        coinrankingUrl: coin.coinrankingUrl,
      });
    });

    console.log("✅ Market data updated from CoinRanking");
  } catch (err) {
    console.error("❌ Market data update failed:", err.message);
  }
}
