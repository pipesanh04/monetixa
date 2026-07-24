import { cookies } from "next/headers";
import {
  isIssuedSerial,
  isSignedSerialValid,
  normalizeSerial,
} from "./serial";

export const AUTH_COOKIE = "mbx_session";
export const AUTH_HEADER_SERIAL = "x-mbx-serial";

export function getValidSerials(): string[] {
  const raw = process.env.VALID_SERIALS || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Acepta:
 * 1) Lista VALID_SERIALS en .env
 * 2) Serial firmado MBX-… (SERIAL_SECRET)
 * 3) Serial en data/issued-serials.json (generado por Serial Admin)
 */
export function isValidSerial(serial: string): boolean {
  const normalized = normalizeSerial(serial);
  if (!normalized) return false;

  if (
    getValidSerials().some((s) => normalizeSerial(s) === normalized)
  ) {
    return true;
  }

  if (isSignedSerialValid(normalized)) return true;

  if (isIssuedSerial(normalized)) return true;

  return false;
}

export async function getSessionSerial(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(AUTH_COOKIE)?.value;
  if (!value || !isValidSerial(value)) return null;
  return value;
}

export async function requireSession(): Promise<string> {
  const serial = await getSessionSerial();
  if (!serial) throw new Error("UNAUTHORIZED");
  return serial;
}
