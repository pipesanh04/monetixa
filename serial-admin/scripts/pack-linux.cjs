#!/usr/bin/env node
/**
 * Empaqueta Serial Admin para Linux sin depender de FUSE:
 * - copia start-linux.sh
 * - crea tar.gz de linux-unpacked
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const release = path.join(root, "release");
const unpacked = path.join(release, "linux-unpacked");
const startSrc = path.join(__dirname, "start-linux.sh");
const startDest = path.join(release, "start-linux.sh");
const tarName = "MonetixaSerialAdmin-0.1.0-linux-x64.tar.gz";
const tarPath = path.join(release, tarName);

if (!fs.existsSync(unpacked)) {
  console.error("Falta release/linux-unpacked. Ejecuta primero dist:linux");
  process.exit(1);
}

fs.copyFileSync(startSrc, startDest);
fs.chmodSync(startDest, 0o755);

execSync(`tar -czf "${tarPath}" -C "${release}" linux-unpacked start-linux.sh`, {
  stdio: "inherit",
});

console.log("Listo:");
console.log(" -", startDest);
console.log(" -", tarPath);
console.log("Uso sin FUSE: cd release && ./start-linux.sh");
