"use client";

import { useState } from "react";
import {
  formatQuotaAmount,
  RETAINED_TOKENS,
  type RetainedToken,
} from "@/lib/retained";
import { logoForCoingeckoId } from "@/lib/logos";
import { NETWORK_LABELS } from "@/lib/tokens";
import { useBuybackStore } from "@/lib/store";
import { interpolate } from "@/i18n";
import { useLocale } from "@/i18n/LocaleProvider";
import { TokenLogo } from "./TokenLogo";

function formatRetained(amount: number, locale: string): string {
  return formatQuotaAmount(amount, locale);
}

export function RetainedTokens() {
  const { t, locale } = useLocale();
  const startRelease = useBuybackStore((s) => s.startRelease);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected: RetainedToken | undefined = selectedId
    ? RETAINED_TOKENS.find((tok) => tok.id === selectedId)
    : undefined;

  function handleRelease() {
    if (!selected) return;
    startRelease(selected.id, selected.network, selected.releaseQuota);
    requestAnimationFrame(() => {
      document
        .getElementById("buyback-wizard")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <section className="animate-fade-up space-y-4 rounded-xl border border-[rgba(196,92,74,0.45)] bg-[rgba(80,24,20,0.35)] px-4 py-5 sm:px-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#f0a090]">
          {t.retained.eyebrow}
        </p>
        <h2 className="mt-1 text-2xl text-[#f8d8d0]">{t.retained.title}</h2>
        <p className="mt-1 text-xs text-[#d4a098]">{t.retained.subtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RETAINED_TOKENS.map((token) => {
          const isSelected = selectedId === token.id;
          return (
            <button
              key={token.id}
              type="button"
              onClick={() =>
                setSelectedId((prev) =>
                  prev === token.id ? null : token.id,
                )
              }
              className={`rounded-lg border px-4 py-4 text-left backdrop-blur-sm transition ${
                isSelected
                  ? "border-[#e87868] bg-[rgba(196,92,74,0.28)]"
                  : "border-[rgba(196,92,74,0.4)] bg-[rgba(60,18,16,0.55)] hover:border-[#e87868]"
              }`}
            >
              <div className="flex items-start gap-3">
                <TokenLogo
                  src={logoForCoingeckoId(token.coingeckoId)}
                  symbol={token.symbol}
                  size={40}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-[#f8d8d0]">
                      {token.symbol}
                    </h3>
                    <span className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-[rgba(196,92,74,0.35)] text-[#f0c4bc]">
                      {NETWORK_LABELS[token.network]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#d4a098]">
                    {token.name}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-lg font-semibold text-[#ffb4a8]">
                {interpolate(t.retained.amountLabel, {
                  amount: formatRetained(token.retainedAmount, locale),
                })}
              </p>

              <p className="mt-3 text-[10px] uppercase tracking-wider text-[#e87868]">
                {t.retained.contract}
              </p>
              <p className="mt-1 break-all font-mono text-xs text-[#d4a098]">
                {token.contractAddress}
              </p>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="flex flex-col gap-3 rounded-lg border border-[rgba(196,92,74,0.5)] bg-[rgba(40,12,10,0.65)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#d4a098]">
            {interpolate(t.retained.selectedHint, {
              symbol: selected.symbol,
              quota: formatQuotaAmount(selected.releaseQuota, locale),
            })}
          </p>
          <button
            type="button"
            onClick={handleRelease}
            className="shrink-0 rounded-md bg-[#c45c4a] px-5 py-2.5 text-sm font-semibold tracking-tight text-[#fff5f2] transition hover:bg-[#d46c58]"
          >
            {t.retained.removeCta}
          </button>
        </div>
      ) : (
        <p className="text-xs text-[#d4a098]">{t.retained.selectHint}</p>
      )}
    </section>
  );
}
