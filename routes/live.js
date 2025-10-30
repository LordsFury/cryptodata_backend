import { WebSocketServer } from "ws";
import { getCoinData } from "../cache/dataStore.js";

export function setupLiveServer(server) {
  const wss = new WebSocketServer({ server });

  setInterval(() => {
    const data = JSON.stringify(Object.values(getCoinData()).slice(0, 500)); 
    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(data);
    });
  }, 3000); 
}
