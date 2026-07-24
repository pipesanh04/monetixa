"use client";

import { useEffect, useMemo, useState } from "react";
import {
  NETWORK_LABELS,
  formatContractShort,
  formatMinAmount,
  getAvailableTokensByNetwork,
  getTokenById,
  getTokenLogo,
  getTokensByNetwork,
  isTokenSuspended,
  meetsMinAmount,
  type Network,
} from "@/lib/tokens";
import {
  calcMarketUsd,
  calcPaymentUsd,
  formatUsd,
} from "@/lib/pricing";
import { useBuybackStore } from "@/lib/store";
import { useLocale } from "@/i18n/LocaleProvider";
import { TokenLogo } from "./TokenLogo";

const NETWORKS: Network[] = ["ethereum", "bsc", "solana"];

export function TokenSelector() {
  const { t, format } = useLocale();
  const {
    network,
    tokenId,
    amount,
    setNetwork,
    setTokenId,
    setAmount,
    setQuote,
    setStep,
  } = useBuybackStore();

  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokens = useMemo(() => getTokensByNetwork(network), [network]);
  const availableCount = useMemo(
    () => getAvailableTokensByNetwork(network).length,
    [network],
  );
  const token = tokenId ? getTokenById(tokenId) : null;
  const suspended = token ? isTokenSuspended(token) : false;
  const amountNum = Number(amount);
  const marketUsd =
    token && !suspended && priceUsd != null && Number.isFinite(amountNum)
      ? calcMarketUsd(amountNum, priceUsd)
      : 0;
  const paymentUsd =
    token && !suspended && priceUsd != null && Number.isFinite(amountNum)
      ? calcPaymentUsd(amountNum, priceUsd)
      : 0;
  const amountValid =
    token && !suspended ? meetsMinAmount(token, amount) : false;
  const minLabel = token ? formatMinAmount(token) : null;

  useEffect(() => {
    if (!token) {
      setPriceUsd(null);
      return;
    }
    if (isTokenSuspended(token)) {
      setPriceUsd(null);
      setLoadingPrice(false);
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
    if (!token || suspended || !amountValid || paymentUsd <= 0 || priceUsd == null)
      return;
    setQuote(paymentUsd, 0);
    setStep("payout");
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          {t.token.step}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">
          {t.token.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{t.token.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {NETWORKS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNetwork(n)}
            className={`rounded-md px-3 py-2 text-sm transition ${
              network === n
                ? "bg-[var(--teal)] text-[#07141a]"
                : "border border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)]"
            }`}
          >
            {NETWORK_LABELS[n]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tokens.map((tok) => {
          const contractShort = formatContractShort(tok);
          const min = formatMinAmount(tok);
          const isSuspended = isTokenSuspended(tok);
          return (
            <button
              key={tok.id}
              type="button"
              disabled={isSuspended}
              onClick={() => {
                if (isSuspended) return;
                setTokenId(tok.id);
              }}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                isSuspended
                  ? "cursor-not-allowed border-[var(--line)] bg-[rgba(7,20,26,0.2)] opacity-50"
                  : tokenId === tok.id
                    ? "border-[var(--gold)] bg-[rgba(212,184,120,0.1)]"
                    : "border-[var(--line)] bg-[rgba(7,20,26,0.35)] hover:border-[rgba(212,184,120,0.4)]"
              }`}
            >
              <TokenLogo src={getTokenLogo(tok)} symbol={tok.symbol} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-tight">
                    {tok.symbol}
                  </span>
                  {isSuspended && (
                    <span className="rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[#f0c4bc] bg-[rgba(196,92,74,0.2)]">
                      {t.token.suspended}
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-[var(--muted)]">
                  {tok.name}
                </div>
                {contractShort ? (
                  <div className="mt-0.5 font-mono text-[10px] text-[var(--muted)]">
                    {contractShort}
                  </div>
                ) : tok.isNative ? (
                  <div className="mt-0.5 text-[10px] text-[var(--muted)]">
                    {t.token.native}
                  </div>
                ) : null}
                {min && !isSuspended && (
                  <div className="mt-0.5 text-[10px] text-[var(--teal-soft)]">
                    {t.token.min} {min}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {availableCount === 0 && (
        <p className="rounded-md border border-[rgba(196,92,74,0.35)] bg-[rgba(196,92,74,0.1)] px-3 py-2 text-sm text-[#f0c4bc]">
          {t.token.noneAvailable}
        </p>
      )}

      {suspended && token && (
        <p className="rounded-md border border-[rgba(196,92,74,0.35)] bg-[rgba(196,92,74,0.1)] px-3 py-2 text-sm text-[#f0c4bc]">
          {format(t.token.suspendedToken, { symbol: token.symbol })}
        </p>
      )}

      <div className="space-y-2">
        <label className="text-sm text-[var(--muted)]" htmlFor="amount">
          {t.token.amountLabel}
        </label>
        {token && formatContractShort(token) && (
          <p className="font-mono text-[11px] text-[var(--muted)]">
            {t.token.contract} {formatContractShort(token)}
          </p>
        )}
        <input
          id="amount"
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={minLabel ? `${t.token.min} ${minLabel}` : "0.00"}
          className="w-full rounded-md border border-[var(--line)] bg-[rgba(7,20,26,0.55)] px-4 py-3 outline-none focus:border-[var(--gold)]"
        />
        {(token?.minDigits || token?.minAmount != null) &&
          amount.trim() &&
          !amountValid && (
          <p className="text-xs text-[#f0c4bc]">
            {format(t.token.minAmount, {
              min: minLabel ?? "",
              symbol: token.symbol,
            })}
          </p>
        )}
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

      <button
        type="button"
        disabled={
          !token ||
          suspended ||
          !amountValid ||
          paymentUsd <= 0 ||
          loadingPrice
        }
        onClick={continueNext}
        className="w-full rounded-md bg-[var(--gold)] px-4 py-3 font-semibold tracking-tight text-[#0b1c24] transition hover:bg-[var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {t.token.continue}
      </button>
    </div>
  );
}
