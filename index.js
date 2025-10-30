// index.js
import express from "express";
import cors from "cors";
import http from "http";
import restRoutes from "./routes/rest.js";
import { startBinanceStream } from "./services/binance.js";
import { setupLiveServer } from "./routes/live.js";
import { updateMarketCaps } from "./services/marketData.js";

const app = express();
app.use(cors());
app.use("/api", restRoutes);

const server = http.createServer(app);
setupLiveServer(server);

// Start services
startBinanceStream();
setInterval(updateMarketCaps, 10 * 60 * 1000); // every 10 minutes
updateMarketCaps();

// updateCoinGeckoData();
// setInterval(updateCoinGeckoData, 10 * 60 * 1000); // update every 10 min

server.listen(4000, () => console.log("Crypto Data API running on port 4000"));
