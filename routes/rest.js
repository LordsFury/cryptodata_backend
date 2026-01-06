import express from "express";
import { getCoinData } from "../cache/dataStore.js";
import CoinModel from "../models/CoinModel.js";
const router = express.Router();

router.get("/tickers", async (req, res) => {
  const cache = getCoinData();
  const cacheValues = Object.values(cache);

  if (cacheValues.length > 0) {
    return res.json(cacheValues.sort((a, b) => a.rank - b.rank));
  }

  // Fallback: fetch from DB if cache empty
  const dbCoins = await CoinModel.find().sort({ rank: 1 });
  return res.json(dbCoins);
});

router.get("/top/:n", async (req, res) => {
  const n = parseInt(req.params.n);
  const data = Object.values(getCoinData())
    .filter((c) => c.market_cap && c.symbol)
    .sort((a, b) => b.market_cap - a.market_cap)
    .slice(0, n);
  res.json(data);
});

router.get("/coin/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const data = getCoinData()[symbol];

  if (!data) {
    return res.status(404).json({ error: "No data yet for " + symbol });
  }

  res.json(data);
});

export default router;
