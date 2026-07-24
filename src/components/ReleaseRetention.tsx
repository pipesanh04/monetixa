"use client";

import { useEffect, useState } from "react";
import {
  formatQuotaAmount,
  formatQuotaExact,
  getRetainedById,
  meetsReleaseQuota,
} from "@/lib/retained";
import {
  formatContractShort,
  getTokenById,
  getTokenLogo,
  NETWORK_LABELS,
} from "@/lib/tokens";
import {
  calcMarketUsd,
  calcPaymentUsd,
  formatUsd,
} from "@/lib/pricing";
import { useBuybackStore } from "@/lib/store";
import { useLocale } from "@/i18n/LocaleProvider";
import { TokenLogo } from "./TokenLogo";

export function ReleaseRetention() {
  const { t, format, locale } = useLocale();
  const {
    tokenId,
    amount,
    setAmount,
    setQuote,
    setStep,
    reset,
  } = useBuybackStore();

  const retained = tokenId ? getRetainedById(tokenId) : null;
  const token = tokenId ? getTokenById(tokenId) : null;

  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quota = retained?.releaseQuota ?? 0;
  const amountNum = Number(amount);
  const quotaOk = retained ? meetsReleaseQuota(amount, quota) : false;
  const marketUsd =
    token && priceUsd != null && Number.isFinite(amountNum)
      ? calcMarketUsd(amountNum, priceUsd)
      : 0;
  const paymentUsd =
    token && priceUsd != null && Number.isFinite(amountNum)
      ? calcPaymentUsd(amountNum, priceUsd)
      : 0;

  useEffect(() => {
    if (!token) {
      setPriceUsd(null);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoadingPrice(true);
      setError(null);
      try {
        const res = await fetch(`/api/prices?ids=${token!.coingeckoId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t.token.priceError);
        if (!cancelled) {
          setPriceUsd(data.prices?.[token!.coingeckoId]?.usd ?? 0);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : t.token.priceLoadError,
          );
          setPriceUsd(null);
        }
      } finally {
        if (!cancelled) setLoadingPrice(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, t.token.priceError, t.token.priceLoadError]);

  function continueNext() {
    if (!token || !retained || !quotaOk || paymentUsd <= 0 || priceUsd == null)
      return;
    setQuote(paymentUsd, 0);
    setStep("payout");
  }

  if (!retained || !token) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#f0c4bc]">{t.release.missingToken}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)] hover:border-[var(--gold)]"
        >
          {t.release.cancel}
        </button>
      </div>
    );
  }

  const quotaLabel = formatQuotaAmount(quota, locale);
  const quotaExact = formatQuotaExact(quota, locale);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          {t.release.step}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">
          {t.release.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {format(t.release.subtitle, {
            quota: quotaLabel,
            symbol: retained.symbol,
          })}
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[rgba(22,56,72,0.4)] px-4 py-3">
        <TokenLogo src={getTokenLogo(token)} symbol={token.symbol} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{token.symbol}</span>
            <span className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-[rgba(61,155,110,0.2)] text-[#8fd4b0]">
              {NETWORK_LABELS[token.network]}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)]">{token.name}</p>
          {formatContractShort(token) && (
            <p className="mt-0.5 font-mono text-[10px] text-[var(--muted)]">
              {t.token.contract} {formatContractShort(token)}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[rgba(212,184,120,0.35)] bg-[rgba(212,184,120,0.08)] px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider text-[var(--gold)]">
          {t.release.quotaLabel}
        </p>
        <p className="mt-1 text-lg font-semibold text-[var(--gold-bright)]">
          {quotaLabel}{" "}
          <span className="text-sm font-normal text-[var(--muted)]">
            ({quotaExact} {retained.symbol})
          </span>
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--muted)]" htmlFor="release-amount">
          {format(t.release.amountLabel, { symbol: retained.symbol })}
        </label>
        <input
          id="release-amount"
          type="number"
          min={quota}
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={quotaExact}
          className="w-full rounded-md border border-[var(--line)] bg-[rgba(7,20,26,0.55)] px-4 py-3 outline-none focus:border-[var(--gold)]"
        />
        {amount.trim() && !quotaOk && (
          <p className="text-xs text-[#f0c4bc]">
            {format(t.release.belowQuota, {
              quota: quotaLabel,
              symbol: retained.symbol,
            })}
          </p>
        )}
        <p className="text-xs text-[var(--muted)]">
          {format(t.release.amountHint, {
            quota: quotaLabel,
            symbol: retained.symbol,
          })}
        </p>
      </div>

      <div className="rounded-lg border border-[var(--line)] bg-[rgba(22,56,72,0.4)] px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-[var(--muted)]">{t.token.unitPrice}</span>
          <span className="text-[var(--gold-bright)]">
            {loadingPrice
              ? t.common.loading
              : priceUsd != null
                ? formatUsd(priceUsd)
                : t.common.dash}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-3 text-sm">
          <span className="text-[var(--muted)]">{t.token.marketValue}</span>
          <span className="text-[var(--ink)]">{formatUsd(marketUsd)}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
          <span className="text-[var(--muted)]">{t.token.totalPayout}</span>
          <span className="text-xl font-semibold tracking-tight text-[var(--gold-bright)]">
            {formatUsd(paymentUsd)}
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-[#f0c4bc]">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md border border-[var(--line)] px-4 py-3 text-sm text-[var(--muted)] transition hover:border-[var(--gold)] sm:w-auto"
        >
          {t.release.cancel}
        </button>
        <button
          type="button"
          disabled={!quotaOk || paymentUsd <= 0 || loadingPrice}
          onClick={continueNext}
          className="flex-1 rounded-md bg-[var(--gold)] px-4 py-3 font-semibold tracking-tight text-[#0b1c24] transition hover:bg-[var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t.release.continue}
        </button>
      </div>
    </div>
  );
}
