// // services/binance.js
// import WebSocket from "ws";
// import { setCoinData, getCoinData } from "../cache/dataStore.js";

// const symbolMap = {
//   WBTC: "BTC",
//   CBBTC: "BTC",
//   BTCB: "BTC",
//   WETH: "ETH",
//   WEETH: "ETH",
//   STETH: "ETH",
//   WSTETH: "ETH",
//   USDC: "USDT",
//   BUSD: "USDT",
//   FDUSD: "USDT",
// };

// export function startBinanceStream() {
//   const ws = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");

//   ws.on("message", (msg) => {
//     try {
//       const tickers = JSON.parse(msg);
//       const store = getCoinData();

//       tickers.forEach((t) => {
//         let base = t.s.replace(/(USDT|FDUSD|BUSD|USDC|TRY)$/, "");
//         base = symbolMap[base] || base;
//         const symbol = base.toUpperCase();

//         const existing = store[symbol];
//         if (!existing) return; // 👈 Skip if not found in CoinGecko

//         setCoinData(symbol, {
//           price: parseFloat(t.c),
//           percent_change_24h: parseFloat(t.P),
//           volume: parseFloat(t.q),
//           last_update: new Date().toISOString(),
//           source: "binance",
//         });
//       });
//     } catch (err) {
//       console.error("Binance parse error:", err);
//     }
//   });

//   ws.on("error", (err) => console.error("Binance WS error:", err));
//   ws.on("close", () => {
//     console.log("Binance WS closed. Reconnecting...");
//     setTimeout(startBinanceStream, 3000);
//   });
// }
