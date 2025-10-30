import WebSocket from "ws";
import { setCoinData } from "../cache/dataStore.js";

const symbolMap = {
  WBTC: "BTC",
  CBBTC: "BTC",
  BTCB: "BTC",
  WETH: "ETH",
  WEETH: "ETH",
  STETH: "ETH",
  WSTETH: "ETH",
  USDC: "USDT",
  BUSD: "USDT",
  FDUSD: "USDT",
};

export function startBinanceStream() {
  const ws = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");

  ws.on("message", (msg) => {
    const tickers = JSON.parse(msg);
    tickers.forEach((t) => {
      let base = t.s.replace(/(USDT|FDUSD|BUSD|USDC|TRY)$/, "");
      base = symbolMap[base] || base;
      const symbol = base.toUpperCase();

      const price = parseFloat(t.c);
      const percent_change_24h = parseFloat(t.P);
      const volume = parseFloat(t.q);

      setCoinData(symbol, { symbol, price, percent_change_24h, volume });
    });
  });

  ws.on("error", (err) => console.error("Binance WS error:", err));
  ws.on("close", () => {
    console.log("Binance WS closed. Reconnecting...");
    setTimeout(startBinanceStream, 3000);
  });
}
