#!/usr/bin/env node
/**
 * Servidor local de pruebas para el feed de updates.
 * Uso: npm run updates:serve
 * Luego UPDATE_FEED_URL=http://127.0.0.1:9090
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "updates");
const port = Number(process.env.UPDATE_SERVE_PORT || 9090);

const mime = {
  ".yml": "text/yaml",
  ".yaml": "text/yaml",
  ".exe": "application/octet-stream",
  ".AppImage": "application/octet-stream",
  ".dmg": "application/octet-stream",
  ".zip": "application/zip",
  ".blockmap": "application/octet-stream",
  ".txt": "text/plain",
};

if (!fs.existsSync(root)) {
  console.error("No existe carpeta updates/. Ejecuta: npm run updates:prepare");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safe === "/" ? "README.txt" : safe);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, {
    "Content-Type": mime[ext] || "application/octet-stream",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Update feed en http://127.0.0.1:${port}`);
  console.log(`Configura: UPDATE_FEED_URL=http://127.0.0.1:${port}`);
  console.log(`Sirviendo: ${root}`);
});
