/**
 * E2E only — stands in for the clinic's CRM/automation webhook so the suite
 * can verify that a submitted inquiry is really delivered (and signed).
 *   POST /hook       record a delivery
 *   GET  /received   list deliveries
 *   GET  /health     readiness probe
 */
import { createServer } from "node:http";

const PORT = Number(process.env.RECEIVER_PORT || 4599);
const received = [];

createServer((req, res) => {
  if (req.method === "POST" && req.url === "/hook") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      received.push({ body, signature: req.headers["x-stars-signature"] ?? null, at: Date.now() });
      res.writeHead(204).end();
    });
    return;
  }
  if (req.method === "GET" && req.url === "/received") {
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(received));
    return;
  }
  if (req.url === "/health") return void res.writeHead(200).end("ok");
  res.writeHead(404).end();
}).listen(PORT, "127.0.0.1", () => console.log(`[webhook-receiver] listening on ${PORT}`));
