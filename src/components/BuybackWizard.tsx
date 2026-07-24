"use client";

import { useBuybackStore } from "@/lib/store";
import { useLocale } from "@/i18n/LocaleProvider";
import { TokenSelector } from "./TokenSelector";
import { PayoutCurrency } from "./PayoutCurrency";
import { DestinationWallet } from "./DestinationWallet";
import { ConfirmTransfer } from "./ConfirmTransfer";

export function BuybackWizard() {
  const step = useBuybackStore((s) => s.step);
  const { t } = useLocale();

  const STEPS = [
    { id: "token" as const, label: t.wizard.steps.token },
    { id: "payout" as const, label: t.wizard.steps.payout },
    { id: "destination" as const, label: t.wizard.steps.destination },
    { id: "confirm" as const, label: t.wizard.steps.confirm },
  ];

  const activeIndex =
    step === "done"
      ? STEPS.length - 1
      : STEPS.findIndex((s) => s.id === step);

  return (
    <section className="animate-fade-up overflow-hidden rounded-xl border border-[var(--line)] bg-[rgba(16,40,52,0.72)] shadow-[var(--shadow)] backdrop-blur-md">
      <div className="border-b border-[var(--line)] px-5 py-4 sm:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
          {t.wizard.eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          {t.wizard.title}
        </h2>
        <ol className="mt-4 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              className={`rounded-full px-3 py-1 text-xs tracking-wide ${
                i <= activeIndex
                  ? "bg-[rgba(42,157,143,0.25)] text-[var(--teal-soft)]"
                  : "bg-[rgba(7,20,26,0.4)] text-[var(--muted)]"
              }`}
            >
              {i + 1}. {s.label}
            </li>
          ))}
        </ol>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {step === "token" && <TokenSelector />}
        {step === "payout" && <PayoutCurrency />}
        {step === "destination" && <DestinationWallet />}
        {(step === "confirm" || step === "done") && <ConfirmTransfer />}
      </div>
    </section>
  );
}
