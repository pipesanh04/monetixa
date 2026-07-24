"use client";

import { useState } from "react";
import type { TokenConfig } from "@/lib/tokens";
import { getDepositQrPath, getDepositWallet, qrDataUrl } from "@/lib/deposit";
import { getTokenLogo } from "@/lib/tokens";
import { useLocale } from "@/i18n/LocaleProvider";
import { TokenLogo } from "./TokenLogo";

type DepositQrProps = {
  token: TokenConfig;
  amount: string;
};

export function DepositQr({ token, amount }: DepositQrProps) {
  const { t, format } = useLocale();
  const [imgFailed, setImgFailed] = useState(false);
  const customQr = getDepositQrPath(token);
  const depositWallet = getDepositWallet(token);
  const fallbackQr = depositWallet ? qrDataUrl(depositWallet) : null;
  const qrSrc = customQr && !imgFailed ? customQr : fallbackQr;

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[rgba(7,20,26,0.45)] p-5">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-2">
          {qrSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrSrc}
              alt={format(t.deposit.qrAlt, { symbol: token.symbol })}
              width={220}
              height={220}
              className="rounded-lg border border-[var(--line)] bg-white p-2"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-lg border border-dashed border-[var(--line)] bg-[rgba(22,56,72,0.35)] px-4 text-center text-xs text-[var(--muted)]">
              {t.deposit.qrUnavailable}
              {depositWallet ? (
                <span className="mt-2 block font-mono text-[10px] text-[var(--gold-bright)]">
                  {depositWallet}
                </span>
              ) : (
                <span className="mt-2 block">
                  {t.deposit.addImage}{" "}
                  <span className="font-mono text-[var(--gold-bright)]">
                    src/qr/
                  </span>
                </span>
              )}
            </div>
          )}
          <p className="text-center text-[10px] text-[var(--muted)]">
            {t.deposit.scanHint}
          </p>
        </div>

        <div className="min-w-0 flex-1 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <TokenLogo src={getTokenLogo(token)} symbol={token.symbol} size={32} />
            <div>
              <p className="font-semibold">{token.symbol}</p>
              <p className="text-xs text-[var(--muted)]">{token.name}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
              {t.deposit.amountLabel}
            </p>
            <p className="mt-1 break-all font-mono text-base text-[var(--gold-bright)]">
              {amount} {token.symbol}
            </p>
          </div>
          {depositWallet && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                {t.deposit.walletLabel}
              </p>
              <p className="mt-1 break-all font-mono text-xs text-[var(--ink)]">
                {depositWallet}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
