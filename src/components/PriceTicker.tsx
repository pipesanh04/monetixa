"use client";

import { useEffect, useState } from "react";
import { TICKER_IDS, TICKER_LABELS, formatUsd } from "@/lib/pricing";
import { logoForCoingeckoId } from "@/lib/logos";
import { useLocale } from "@/i18n/LocaleProvider";
import { TokenLogo } from "./TokenLogo";

type PriceEntry = { usd: number; change24h: number | null };

export function PriceTicker() {
  const { t } = useLocale();
  const [prices, setPrices] = useState<Record<string, PriceEntry> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/prices?ids=${TICKER_IDS.join(",")}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setPrices(data.prices);
      } catch {
        /* ignore */
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const items = TICKER_IDS.map((id) => ({
    id,
    label: TICKER_LABELS[id],
    logo: logoForCoingeckoId(id),
    usd: prices?.[id]?.usd ?? null,
    change: prices?.[id]?.change24h ?? null,
  }));

  const doubled = [...items, ...items];

  return (
    <div className="animate-fade-up overflow-hidden rounded-lg border border-[var(--line)] bg-[rgba(11,28,36,0.75)]">
      <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
          {t.ticker.live}
        </span>
        <span className="text-[10px] text-[var(--muted)]">
          {t.ticker.subtitle}
        </span>
      </div>
      <div className="relative overflow-hidden py-3">
        <div className="animate-ticker flex w-max gap-10 px-6">
          {doubled.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="flex items-center gap-2.5 whitespace-nowrap"
            >
              <TokenLogo src={item.logo} symbol={item.label} size={22} />
              <span className="text-sm font-semibold text-[var(--ink)]">
                {item.label}
              </span>
              <span className="text-sm text-[var(--gold-bright)]">
                {item.usd != null ? formatUsd(item.usd) : t.common.dash}
              </span>
              {item.change != null && (
                <span
                  className={`text-xs ${
                    item.change >= 0 ? "text-[#8fd4b0]" : "text-[#f0c4bc]"
                  }`}
                >
                  {item.change >= 0 ? "+" : ""}
                  {item.change.toFixed(2)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
