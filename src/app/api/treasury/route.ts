import { NextResponse } from "next/server";
import { getSessionSerial } from "@/lib/auth";
import { getPublicTreasuryStatus } from "@/lib/wallets";

export async function GET() {
  const serial = await getSessionSerial();
  if (!serial) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getPublicTreasuryStatus());
}
