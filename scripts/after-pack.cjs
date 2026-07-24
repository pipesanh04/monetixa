#!/usr/bin/env node
/**
 * electron-builder excluye node_modules de extraResources.
 * Tras el pack, copiamos el standalone completo (con next).
 */
const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

exports.default = async function afterPack(context) {
  const src = path.join(context.packager.projectDir, "resources", "electron-standalone");
  const dest = path.join(context.appOutDir, "resources", "standalone");
  if (!fs.existsSync(path.join(src, "node_modules", "next"))) {
    throw new Error("Falta resources/electron-standalone/node_modules/next");
  }
  fs.rmSync(dest, { recursive: true, force: true });
  copyDir(src, dest);
  console.log("afterPack: standalone + node_modules →", dest);
};
