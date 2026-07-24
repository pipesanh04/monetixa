import { NextResponse } from "next/server";
import { getSessionSerial } from "@/lib/auth";
import type { OrderRecord } from "@/app/api/submit-transfer/route";

declare global {
  // eslint-disable-next-line no-var
  var __mbxOrders: OrderRecord[] | undefined;
}

function getStore(): OrderRecord[] {
  if (!globalThis.__mbxOrders) {
    globalThis.__mbxOrders = [];
  }
  return globalThis.__mbxOrders;
}

export async function GET() {
  const serial = await getSessionSerial();
  if (!serial) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = getStore().filter((o) => o.serial === serial);
  return NextResponse.json({ orders });
}
