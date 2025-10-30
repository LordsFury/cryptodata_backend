import express from "express";
import { getCoinData } from "../cache/dataStore.js";
const router = express.Router();

router.get("/tickers", (req, res) => {
  const data = Object.values(getCoinData());
  res.json(data);
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
