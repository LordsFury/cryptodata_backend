// index.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import http from "http";
import restRoutes from "./routes/rest.js";
import { setupLiveServer } from "./routes/live.js";
import { initData } from "./services/marketData.js";
import connectToMongo from "./config/db.js";
import "./jobs/updater.js";

const app = express();
app.use(cors());

const server = http.createServer(app);
setupLiveServer(server);

// Initialize with error handling
(async () => {
  try {
    await connectToMongo();
  } catch (error) {
    console.error('⚠️ MongoDB connection failed, continuing anyway...');
  }
  
  try {
    await initData();
  } catch (error) {
    console.error('⚠️ initData failed:', error.message);
  }
})();

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

app.use("/api", restRoutes);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Crypto Data API running on port ${PORT}`));