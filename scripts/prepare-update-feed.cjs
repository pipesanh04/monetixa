#!/usr/bin/env node
/**
 * Prepara la carpeta `updates/` para el feed de auto-actualización.
 *
 * Flujo:
 * 1. Sube version en package.json (ej. 0.1.0 → 0.1.1)
 * 2. npm run dist:linux  (y dist:win / dist:mac)
 * 3. npm run updates:prepare
 * 4. Sube el contenido de updates/ a tu servidor (UPDATE_FEED_URL)
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const releaseDir = path.join(root, "release");
const updatesDir = path.join(root, "updates");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = pkg.version;

fs.mkdirSync(updatesDir, { recursive: true });

function copyIfExists(name) {
  const src = path.join(releaseDir, name);
  if (!fs.existsSync(src)) return false;
  const dest = path.join(updatesDir, name);
  fs.copyFileSync(src, dest);
  console.log(" +", name);
  return true;
}

function copyMatching(regex) {
  if (!fs.existsSync(releaseDir)) return 0;
  let n = 0;
  for (const name of fs.readdirSync(releaseDir)) {
    if (regex.test(name)) {
      if (copyIfExists(name)) n += 1;
    }
  }
  return n;
}

console.log(`Preparando feed v${version} → updates/`);

const copied =
  copyMatching(/^latest.*\.yml$/i) +
  copyMatching(/\.AppImage$/i) +
  copyMatching(/\.exe$/i) +
  copyMatching(/\.dmg$/i) +
  copyMatching(/\.zip$/i) +
  copyMatching(/\.blockmap$/i);

// README del feed
fs.writeFileSync(
  path.join(updatesDir, "README.txt"),
  [
    `Monetixa update feed — version ${version}`,
    `Generado: ${new Date().toISOString()}`,
    "",
    "Sube TODOS estos archivos a Hostinger → public_html/monetixa/",
    "URL pública (UPDATE_FEED_URL): https://sanbustv.io/monetixa",
    "",
    "Archivos típicos:",
    "  latest-linux.yml + Monetixa-x.y.z.AppImage",
    "  latest.yml       + Monetixa Setup x.y.z.exe  (NSIS)",
    "  latest-mac.yml   + Monetixa-x.y.z-mac.zip / .dmg",
    "  .htaccess        (sirve estáticos en Hostinger)",
    "",
  ].join("\n"),
  "utf8",
);

// .htaccess para Hostinger (Apache)
const htSrc = path.join(__dirname, "updates-htaccess.txt");
if (fs.existsSync(htSrc)) {
  fs.copyFileSync(htSrc, path.join(updatesDir, ".htaccess"));
  console.log(" + .htaccess");
}

if (copied === 0) {
  console.warn(
    "No se copiaron artefactos. Ejecuta antes: npm run dist:linux / dist:win",
  );
  process.exitCode = 1;
} else {
  console.log(`Listo: ${copied} archivo(s) en updates/`);
  console.log("Siguiente: sube updates/ a tu servidor y configura UPDATE_FEED_URL");
}
