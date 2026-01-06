// src/jobs/updater.js
import cron from "node-cron";
import { updateMarketCaps } from "../services/marketData.js";

let isUpdating = false;

// Runs every hour
cron.schedule("0 * * * *", async () => {
  if (isUpdating) {
    console.log("⚙️ Skipping cron — update still running");
    return;
  }

  isUpdating = true;
  console.log("⏰ Running hourly CoinGecko update...");
  try {
    await updateMarketCaps();
  } catch (err) {
    console.error("❌ Cron update failed:", err.message);
  } finally {
    isUpdating = false;
  }
});

console.log("🕒 Cron job scheduled: runs hourly");
