"use client";

import { useBuybackStore } from "@/lib/store";
import { getPayoutAsset } from "@/lib/payout";
import { isValidDestinationWallet } from "@/lib/wallets";
import { formatCrypto, formatUsd } from "@/lib/pricing";
import { useLocale } from "@/i18n/LocaleProvider";

export function DestinationWallet() {
  const { t, format } = useLocale();
  const {
    destinationWallet,
    setDestinationWallet,
    payoutAssetId,
    paymentUsd,
    payoutAmount,
    setStep,
  } = useBuybackStore();

  const asset = payoutAssetId ? getPayoutAsset(payoutAssetId) : null;
  const valid =
    !!payoutAssetId &&
    isValidDestinationWallet(destinationWallet, payoutAssetId);

  const placeholder =
    asset?.id === "btc"
      ? t.destination.placeholderBtc
      : asset?.id === "usdt-tron"
        ? t.destination.placeholderTron
        : asset?.id === "sol" || asset?.id === "usdt-solana"
          ? t.destination.placeholderSol
          : t.destination.placeholderEvm;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          {t.destination.step}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">
          {t.destination.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {t.destination.subtitleBefore}{" "}
          <span className="text-[var(--gold-bright)]">
            {formatCrypto(payoutAmount)} {asset?.symbol}
          </span>{" "}
          {format(t.destination.subtitleAfter, {
            usd: formatUsd(paymentUsd),
          })}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--muted)]" htmlFor="dest">
          {t.destination.label}
        </label>
        <textarea
          id="dest"
          rows={3}
          value={destinationWallet}
          onChange={(e) => setDestinationWallet(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded-md border border-[var(--line)] bg-[rgba(7,20,26,0.55)] px-4 py-3 font-mono text-sm outline-none focus:border-[var(--gold)]"
        />
        {destinationWallet.trim() && !valid && (
          <p className="text-xs text-[#f0c4bc]">
            {format(t.destination.invalid, {
              network: asset?.networkLabel ?? "",
            })}
          </p>
        )}
        {valid && (
          <p className="text-xs text-[#8fd4b0]">{t.destination.valid}</p>
        )}
      </div>

      <div className="rounded-lg border border-[var(--line)] bg-[rgba(22,56,72,0.4)] px-4 py-3 text-sm text-[var(--muted)]">
        {t.destination.networkNoteBefore}{" "}
        <span className="text-[var(--ink)]">{asset?.networkLabel}</span>
        {t.destination.networkNoteAfter}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep("payout")}
          className="rounded-md border border-[var(--line)] px-4 py-3 text-[var(--muted)] transition hover:border-[var(--gold)]"
        >
          {t.common.back}
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={() => setStep("confirm")}
          className="flex-1 rounded-md bg-[var(--gold)] px-4 py-3 font-semibold text-[#0b1c24] transition hover:bg-[var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t.destination.review}
        </button>
      </div>
    </div>
  );
}
