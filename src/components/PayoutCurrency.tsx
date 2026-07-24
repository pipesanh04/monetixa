"use client";

import { useEffect, useState } from "react";
import { PAYOUT_ASSETS, getPayoutAsset, getPayoutLogo } from "@/lib/payout";
import {
  calcPayoutAmount,
  formatCrypto,
  formatUsd,
} from "@/lib/pricing";
import { useBuybackStore } from "@/lib/store";
import { useLocale } from "@/i18n/LocaleProvider";
import { TokenLogo } from "./TokenLogo";

export function PayoutCurrency() {
  const { t, format } = useLocale();
  const {
    paymentUsd,
    payoutAssetId,
    setPayoutAssetId,
    setQuote,
    setStep,
  } = useBuybackStore();

  const [payoutPrice, setPayoutPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const asset = payoutAssetId ? getPayoutAsset(payoutAssetId) : null;
  const payoutAmount =
    asset && payoutPrice != null
      ? calcPayoutAmount(paymentUsd, payoutPrice)
      : 0;

  useEffect(() => {
    if (!asset) {
      setPayoutPrice(null);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/prices?ids=${asset!.coingeckoId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t.payout.priceError);
        if (!cancelled) {
          setPayoutPrice(data.prices?.[asset!.coingeckoId]?.usd ?? 0);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : t.payout.priceLoadError,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [asset, t.payout.priceError, t.payout.priceLoadError]);

  function continueNext() {
    if (!asset || payoutAmount <= 0) return;
    setQuote(paymentUsd, payoutAmount);
    setStep("destination");
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          {t.payout.step}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">
          {t.payout.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {t.payout.totalLabel}{" "}
          <span className="text-[var(--gold-bright)]">
            {formatUsd(paymentUsd)}
          </span>
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {PAYOUT_ASSETS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setPayoutAssetId(a.id)}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
              payoutAssetId === a.id
                ? "border-[var(--gold)] bg-[rgba(212,184,120,0.1)]"
                : "border-[var(--line)] bg-[rgba(7,20,26,0.35)] hover:border-[rgba(212,184,120,0.4)]"
            }`}
          >
            <TokenLogo src={getPayoutLogo(a)} symbol={a.symbol} size={36} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold tracking-tight">{a.symbol}</span>
                <span className="truncate text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  {a.networkLabel}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-[var(--muted)]">{a.name}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--line)] bg-[rgba(22,56,72,0.4)] px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-[var(--muted)]">
            {format(t.payout.priceOf, { symbol: asset?.symbol ?? t.common.dash })}
          </span>
          <span className="text-[var(--gold-bright)]">
            {loading
              ? t.common.loading
              : payoutPrice != null
                ? formatUsd(payoutPrice)
                : t.common.dash}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
          <span className="text-[var(--muted)]">{t.payout.youReceive}</span>
          <span className="text-xl font-semibold tracking-tight text-[var(--gold-bright)]">
            {asset
              ? `${formatCrypto(payoutAmount)} ${asset.symbol}`
              : t.common.dash}
          </span>
        </div>
        {asset && payoutAmount > 0 && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            {formatUsd(paymentUsd)} ÷ {formatUsd(payoutPrice ?? 0)} ={" "}
            {formatCrypto(payoutAmount)} {asset.symbol}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-[#f0c4bc]">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep("token")}
          className="rounded-md border border-[var(--line)] px-4 py-3 text-[var(--muted)] transition hover:border-[var(--gold)]"
        >
          {t.common.back}
        </button>
        <button
          type="button"
          disabled={!asset || payoutAmount <= 0 || loading}
          onClick={continueNext}
          className="flex-1 rounded-md bg-[var(--gold)] px-4 py-3 font-semibold tracking-tight text-[#0b1c24] transition hover:bg-[var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t.common.continue}
        </button>
      </div>
    </div>
  );
}
