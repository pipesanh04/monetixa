#!/usr/bin/env node
/**
 * Empaqueta Monetixa Linux sin FUSE (tar.gz + start script).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const release = path.join(root, "release");
const unpacked = path.join(release, "linux-unpacked");
const startSrc = path.join(__dirname, "start-linux.sh");
const startDest = path.join(release, "start-linux.sh");
const tarPath = path.join(release, "Monetixa-0.1.0-linux-x64.tar.gz");

if (!fs.existsSync(unpacked)) {
  console.error("Falta release/linux-unpacked");
  process.exit(1);
}

fs.copyFileSync(startSrc, startDest);
fs.chmodSync(startDest, 0o755);
execSync(`tar -czf "${tarPath}" -C "${release}" linux-unpacked start-linux.sh`, {
  stdio: "inherit",
});
console.log("Linux pack:", tarPath);
