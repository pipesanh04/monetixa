"use client";

import { useState } from "react";
import { useBuybackStore } from "@/lib/store";
import {
  formatContractShort,
  getTokenById,
  getTokenLogo,
  NETWORK_LABELS,
} from "@/lib/tokens";
import { getPayoutAsset, getPayoutLogo } from "@/lib/payout";
import { formatCrypto, formatUsd } from "@/lib/pricing";
import { explorerTxUrl } from "@/lib/transfer";
import { isValidTxHash } from "@/lib/deposit";
import { useLocale } from "@/i18n/LocaleProvider";
import { TokenLogo } from "./TokenLogo";
import { DepositQr } from "./DepositQr";

export function ConfirmTransfer() {
  const { t, format } = useLocale();
  const store = useBuybackStore();
  const token = store.tokenId ? getTokenById(store.tokenId) : null;
  const asset = store.payoutAssetId
    ? getPayoutAsset(store.payoutAssetId)
    : null;

  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailNote, setEmailNote] = useState<string | null>(null);

  const txValid =
    token && txHash.trim() ? isValidTxHash(txHash, token.network) : false;

  async function submit() {
    if (!token || !asset || !txValid) return;
    setLoading(true);
    setError(null);
    setEmailNote(null);

    try {
      const res = await fetch("/api/submit-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: token.id,
          amount: store.amount,
          paymentUsd: store.paymentUsd,
          payoutAssetId: asset.id,
          payoutAmount: store.payoutAmount,
          destinationWallet: store.destinationWallet.trim(),
          txHash: txHash.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.confirm.submitError);

      if (!data.emailSent && data.emailNote) {
        setEmailNote(data.emailNote);
      }

      store.setResult(data.order.id, txHash.trim(), false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.confirm.sendError);
    } finally {
      setLoading(false);
    }
  }

  if (store.step === "done") {
    return (
      <div className="space-y-6 animate-fade-up text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(61,155,110,0.2)] text-2xl text-[#8fd4b0]">
          ✓
        </div>
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">
            {t.confirm.doneTitle}
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {t.confirm.doneBodyBefore}{" "}
            {formatCrypto(store.payoutAmount)} {asset?.symbol}{" "}
            {t.confirm.doneBodyAfter}{" "}
            <span className="break-all text-[var(--ink)]">
              {store.destinationWallet}
            </span>
            .
          </p>
          {emailNote && (
            <p className="mt-2 text-xs text-[var(--gold-bright)]">{emailNote}</p>
          )}
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-[rgba(22,56,72,0.4)] px-4 py-3 text-left text-sm">
          <p className="text-[var(--muted)]">{t.confirm.orderId}</p>
          <p className="mt-1 font-mono text-[var(--gold-bright)]">
            {store.lastOrderId}
          </p>
          {store.lastTxHash && token && (
            <>
              <p className="mt-3 text-[var(--muted)]">TX Hash</p>
              <a
                href={explorerTxUrl(token.network, store.lastTxHash)}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block break-all text-[var(--teal-soft)] underline"
              >
                {store.lastTxHash}
              </a>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => store.reset()}
          className="rounded-md bg-[var(--gold)] px-6 py-3 font-semibold text-[#0b1c24]"
        >
          {t.confirm.newOp}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          {t.confirm.step}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">
          {t.confirm.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{t.confirm.subtitle}</p>
      </div>

      <dl className="space-y-3 rounded-lg border border-[var(--line)] bg-[rgba(22,56,72,0.4)] px-4 py-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[var(--muted)]">{t.confirm.token}</dt>
          <dd className="flex items-center gap-2">
            {token && (
              <TokenLogo
                src={getTokenLogo(token)}
                symbol={token.symbol}
                size={22}
              />
            )}
            <span>
              {store.amount} {token?.symbol} (
              {token && NETWORK_LABELS[token.network]})
              {token && formatContractShort(token) && (
                <span className="mt-0.5 block font-mono text-[10px] text-[var(--muted)]">
                  {formatContractShort(token)}
                </span>
              )}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--muted)]">{t.confirm.totalPayout}</dt>
          <dd className="text-[var(--gold-bright)]">
            {formatUsd(store.paymentUsd)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[var(--muted)]">{t.confirm.payout}</dt>
          <dd className="flex items-center gap-2 text-right">
            {asset && (
              <TokenLogo
                src={getPayoutLogo(asset)}
                symbol={asset.symbol}
                size={22}
              />
            )}
            <span>
              {formatCrypto(store.payoutAmount)} {asset?.symbol}
              <span className="block text-xs text-[var(--muted)]">
                {asset?.networkLabel}
              </span>
            </span>
          </dd>
        </div>
        <div className="border-t border-[var(--line)] pt-3">
          <dt className="text-[var(--muted)]">{t.confirm.destWallet}</dt>
          <dd className="mt-1 break-all font-mono text-xs">
            {store.destinationWallet}
          </dd>
        </div>
      </dl>

      {token && <DepositQr token={token} amount={store.amount} />}

      <div className="space-y-2">
        <label className="text-sm text-[var(--muted)]" htmlFor="txhash">
          {t.confirm.txLabel}
        </label>
        <input
          id="txhash"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder={
            token?.network === "solana"
              ? t.confirm.txPlaceholderSol
              : t.confirm.txPlaceholderEvm
          }
          className="w-full rounded-md border border-[var(--line)] bg-[rgba(7,20,26,0.55)] px-4 py-3 font-mono text-sm outline-none focus:border-[var(--gold)]"
        />
        {txHash.trim() && !txValid && (
          <p className="text-xs text-[#f0c4bc]">
            {format(t.confirm.txInvalid, {
              network: token ? NETWORK_LABELS[token.network] : "",
            })}
          </p>
        )}
        <p className="text-[10px] text-[var(--muted)]">{t.confirm.notifyNote}</p>
      </div>

      {error && <p className="text-sm text-[#f0c4bc]">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => store.setStep("destination")}
          disabled={loading}
          className="rounded-md border border-[var(--line)] px-4 py-3 text-[var(--muted)] transition hover:border-[var(--gold)]"
        >
          {t.common.back}
        </button>
        <button
          type="button"
          disabled={loading || !txValid}
          onClick={submit}
          className="flex-1 rounded-md bg-[var(--gold)] px-4 py-3 font-semibold text-[#0b1c24] transition hover:bg-[var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loading ? t.confirm.sending : t.confirm.submit}
        </button>
      </div>
    </div>
  );
}
