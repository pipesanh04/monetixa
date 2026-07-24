#!/usr/bin/env node
/**
 * Prepara un standalone limpio para Electron:
 * - Copia static/public al output de Next
 * - Elimina basura arrastrada por NFT (release, serial-admin, etc.)
 * - Escribe resources/electron-standalone para extraResources
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const publicSrc = path.join(root, "public");
const electronStandalone = path.join(root, "resources", "electron-standalone");

const JUNK = [
  "release",
  "serial-admin",
  "scripts",
  "electron",
  "src",
  "shared",
  "data",
  "updates",
  "resources",
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "RELEASES.md",
  "TOKEN_IDS.md",
  "UPDATES.md",
  "eslint.config.mjs",
  "next.config.ts",
  "postcss.config.mjs",
  "tsconfig.json",
  "tsconfig.tsbuildinfo",
  "package-lock.json",
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

if (!fs.existsSync(path.join(standalone, "server.js"))) {
  console.error("Falta .next/standalone. Ejecuta primero: npm run build");
  process.exit(1);
}

copyDir(staticSrc, path.join(standalone, ".next", "static"));
copyDir(publicSrc, path.join(standalone, "public"));

for (const name of JUNK) {
  rmrf(path.join(standalone, name));
}

if (!fs.existsSync(path.join(standalone, "node_modules", "next"))) {
  console.error("Standalone sin node_modules/next — revisa output: 'standalone'");
  process.exit(1);
}

rmrf(electronStandalone);
copyDir(standalone, electronStandalone);

console.log("Standalone listo para Electron:", electronStandalone);
const size = fs.readdirSync(electronStandalone).join(", ");
console.log("Contenido:", size);
