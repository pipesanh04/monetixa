"use client";

import { BANKS } from "@/lib/banks";
import { NETWORK_LABELS } from "@/lib/tokens";
import { useLocale } from "@/i18n/LocaleProvider";

export function BanksStrip() {
  const { t } = useLocale();

  return (
    <section className="animate-fade-up space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
            {t.banks.eyebrow}
          </p>
          <h2 className="mt-1 text-2xl text-[var(--ink)]">{t.banks.title}</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">{t.banks.subtitle}</p>
        </div>
        <span className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--teal)] animate-pulse-soft" />
          {t.banks.live}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {BANKS.map((bank) => (
          <article
            key={bank.id}
            className="rounded-lg border border-[var(--line)] bg-[rgba(22,56,72,0.55)] px-4 py-4 backdrop-blur-sm transition hover:border-[rgba(212,184,120,0.45)]"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                {bank.name}
              </h3>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${
                  bank.status === "active"
                    ? "bg-[rgba(61,155,110,0.2)] text-[#8fd4b0]"
                    : "bg-[rgba(212,184,120,0.15)] text-[var(--gold-bright)]"
                }`}
              >
                {bank.status === "active"
                  ? t.banks.statusMarket
                  : t.banks.statusProcess}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              {t.banks.taglines[bank.id]}
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--teal-soft)]">
              {bank.networks.map((n) => NETWORK_LABELS[n]).join(" · ")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
