import { NextResponse } from "next/server";
import { getSessionSerial } from "@/lib/auth";

const COINGECKO =
  "https://api.coingecko.com/api/v3/simple/price";

export async function GET(request: Request) {
  const serial = await getSessionSerial();
  if (!serial) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");
  const ids =
    idsParam
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "Missing ids parameter" },
      { status: 400 },
    );
  }

  try {
    const url = `${COINGECKO}?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url, {
      next: { revalidate: 30 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`CoinGecko ${res.status}`);
    }

    const data = (await res.json()) as Record<
      string,
      { usd?: number; usd_24h_change?: number }
    >;

    const prices: Record<string, { usd: number; change24h: number | null }> =
      {};
    for (const id of ids) {
      const entry = data[id];
      prices[id] = {
        usd: entry?.usd ?? 0,
        change24h:
          typeof entry?.usd_24h_change === "number"
            ? entry.usd_24h_change
            : null,
      };
    }

    return NextResponse.json({ prices, updatedAt: Date.now() });
  } catch (err) {
    console.error("prices error", err);
    return NextResponse.json(
      { error: "No se pudieron obtener precios. Intenta de nuevo." },
      { status: 502 },
    );
  }
}
