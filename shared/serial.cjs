const { createHmac, randomBytes } = require("crypto");
const fs = require("fs");
const path = require("path");

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getSerialSecret() {
  return (
    process.env.SERIAL_SECRET?.trim() ||
    process.env.MBX_SERIAL_SECRET?.trim() ||
    ""
  );
}

function checksum(payload, secret) {
  const digest = createHmac("sha256", secret).update(payload).digest();
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[digest[i] % ALPHABET.length];
  }
  return out;
}

function randomBlock(len) {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

function normalizeSerial(serial) {
  return String(serial || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function generateSerial(plan = "PRO") {
  const secret = getSerialSecret();
  if (!secret) {
    throw new Error("SERIAL_SECRET no configurado.");
  }
  const planCode = String(plan)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(3, "X");
  const a = randomBlock(4);
  const b = randomBlock(4);
  const body = `MBX-${planCode}-${a}-${b}`;
  return `${body}-${checksum(body, secret)}`;
}

function generateSerialBatch(count, plan = "PRO") {
  const n = Math.max(1, Math.min(500, Math.floor(Number(count) || 1)));
  const out = [];
  const seen = new Set();
  while (out.length < n) {
    const s = generateSerial(plan);
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

function isSignedSerialValid(serial) {
  const secret = getSerialSecret();
  if (!secret) return false;
  const s = normalizeSerial(serial);
  const match =
    /^MBX-([A-Z0-9]{3,4})-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/.exec(s);
  if (!match) return false;
  const body = `MBX-${match[1]}-${match[2]}-${match[3]}`;
  return checksum(body, secret) === match[4];
}

function loadRegistry(filePath) {
  if (!fs.existsSync(filePath)) {
    return { serials: [] };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return {
      serials: Array.isArray(raw.serials) ? raw.serials : [],
    };
  } catch {
    return { serials: [] };
  }
}

function saveRegistry(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function appendIssuedSerials(filePath, serials, note, plan) {
  const registry = loadRegistry(filePath);
  const existing = new Set(
    registry.serials.map((row) => normalizeSerial(row.serial)),
  );
  const createdAt = new Date().toISOString();
  for (const serial of serials) {
    const n = normalizeSerial(serial);
    if (existing.has(n)) continue;
    registry.serials.unshift({
      serial: n,
      createdAt,
      note: note || undefined,
      plan: plan || undefined,
    });
    existing.add(n);
  }
  saveRegistry(filePath, registry);
  return registry;
}

module.exports = {
  ALPHABET,
  normalizeSerial,
  generateSerial,
  generateSerialBatch,
  isSignedSerialValid,
  loadRegistry,
  saveRegistry,
  appendIssuedSerials,
  getSerialSecret,
};
