// index.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import http from "http";
import restRoutes from "./routes/rest.js";
// import { startBinanceStream } from "./services/binance.js";
import { setupLiveServer } from "./routes/live.js";
import { initData } from "./services/marketData.js";
import connectToMongo from "./config/db.js";
import "./jobs/updater.js";
// import { getCoinData } from "./cache/dataStore.js";

const app = express();
app.use(cors());

const server = http.createServer(app);
setupLiveServer(server);

(async () => {
  await connectToMongo();
  await initData(); // fill cache from DB or fetch new data
})();

// ============== HEALTH CHECK ENDPOINT ==============
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});
// ============== END HEALTH CHECK ==============

app.use("/api", restRoutes);

// (async function init() {
//   console.log("📄 Fetching CoinGecko metadata (top 1000)...");
//   await updateMarketCaps(); // <- fills coinData with id, name, image, rank, etc.

//   console.log("🚀 Starting Binance WS to update live prices...");
//   startBinanceStream(); // now it will merge into existing entries rather than create minimal ones

//   // schedule periodic metadata refresh
//   setInterval(updateMarketCaps, 10 * 60 * 1000);
// })();

server.listen(4000, () => console.log("✅ Crypto Data API running on port 4000"));