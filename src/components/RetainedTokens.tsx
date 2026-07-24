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
    <section className="animate-fade-up space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
          {t.retained.eyebrow}
        </p>
        <h2 className="mt-1 text-2xl text-[var(--ink)]">{t.retained.title}</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">{t.retained.subtitle}</p>
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
                  ? "border-[var(--gold)] bg-[rgba(212,184,120,0.12)]"
                  : "border-[var(--line)] bg-[rgba(22,56,72,0.55)] hover:border-[rgba(212,184,120,0.45)]"
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
                    <h3 className="text-base font-semibold text-[var(--ink)]">
                      {token.symbol}
                    </h3>
                    <span className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-[rgba(61,155,110,0.2)] text-[#8fd4b0]">
                      {NETWORK_LABELS[token.network]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {token.name}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-lg font-semibold text-[var(--gold-bright)]">
                {interpolate(t.retained.amountLabel, {
                  amount: formatRetained(token.retainedAmount, locale),
                })}
              </p>

              <p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--teal-soft)]">
                {t.retained.contract}
              </p>
              <p className="mt-1 break-all font-mono text-xs text-[var(--muted)]">
                {token.contractAddress}
              </p>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="flex flex-col gap-3 rounded-lg border border-[var(--line)] bg-[rgba(16,40,52,0.72)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            {interpolate(t.retained.selectedHint, {
              symbol: selected.symbol,
              quota: formatQuotaAmount(selected.releaseQuota, locale),
            })}
          </p>
          <button
            type="button"
            onClick={handleRelease}
            className="shrink-0 rounded-md bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold tracking-tight text-[#0b1c24] transition hover:bg-[var(--gold-bright)]"
          >
            {t.retained.removeCta}
          </button>
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)]">{t.retained.selectHint}</p>
      )}
    </section>
  );
}
