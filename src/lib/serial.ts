import { createHmac, randomBytes } from "crypto";
import { readFileSync, existsSync } from "fs";
import path from "path";

/** Alfabeto sin caracteres ambiguos (0/O, 1/I). */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type IssuedSerial = {
  serial: string;
  createdAt: string;
  note?: string;
  plan?: string;
};

function getSerialSecret(): string {
  return (
    process.env.SERIAL_SECRET?.trim() ||
    process.env.MBX_SERIAL_SECRET?.trim() ||
    ""
  );
}

function getIssuedSerialsPath(): string {
  return (
    process.env.ISSUED_SERIALS_PATH?.trim() ||
    path.join(
      /* turbopackIgnore: true */ process.cwd(),
      "data",
      "issued-serials.json",
    )
  );
}

export function normalizeSerial(serial: string): string {
  return serial.trim().toUpperCase().replace(/\s+/g, "");
}

function checksum(payload: string, secret: string): string {
  const digest = createHmac("sha256", secret).update(payload).digest();
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[digest[i]! % ALPHABET.length];
  }
  return out;
}

function randomBlock(len: number): string {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

/**
 * Genera un serial profesional:
 * MBX-XXXX-XXXX-XXXX-CCCC
 * (CCCC = checksum HMAC con SERIAL_SECRET)
 */
export function generateSerial(plan = "PRO"): string {
  const secret = getSerialSecret();
  if (!secret) {
    throw new Error("SERIAL_SECRET no configurado en el entorno.");
  }
  const planCode = plan
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(3, "X");
  const a = randomBlock(4);
  const b = randomBlock(4);
  const body = `MBX-${planCode}-${a}-${b}`;
  const c = checksum(body, secret);
  return `${body}-${c}`;
}

export function generateSerialBatch(
  count: number,
  plan = "PRO",
): string[] {
  const n = Math.max(1, Math.min(500, Math.floor(count)));
  const out: string[] = [];
  const seen = new Set<string>();
  while (out.length < n) {
    const s = generateSerial(plan);
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

/** Valida formato + checksum firmado. */
export function isSignedSerialValid(serial: string): boolean {
  const secret = getSerialSecret();
  if (!secret) return false;
  const s = normalizeSerial(serial);
  const match = /^MBX-([A-Z0-9]{3,4})-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/.exec(
    s,
  );
  if (!match) return false;
  const body = `MBX-${match[1]}-${match[2]}-${match[3]}`;
  const expected = checksum(body, secret);
  return expected === match[4];
}

export function loadIssuedSerials(filePath?: string): IssuedSerial[] {
  const file = filePath || getIssuedSerialsPath();
  if (!existsSync(file)) return [];
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as {
      serials?: IssuedSerial[];
    };
    return Array.isArray(raw.serials) ? raw.serials : [];
  } catch {
    return [];
  }
}

export function isIssuedSerial(serial: string, filePath?: string): boolean {
  const normalized = normalizeSerial(serial);
  return loadIssuedSerials(filePath).some(
    (row) => normalizeSerial(row.serial) === normalized,
  );
}
