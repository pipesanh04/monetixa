"use client";

import { LOCALE_META, LOCALES, type Locale } from "@/i18n";
import { useLocale } from "@/i18n/LocaleProvider";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({
  className = "",
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[rgba(7,20,26,0.45)] p-1 ${className}`}
    >
      {LOCALES.map((id) => {
        const meta = LOCALE_META[id as Locale];
        const active = locale === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setLocale(id)}
            title={meta.name}
            aria-pressed={active}
            className={`rounded px-2 py-1 text-[11px] tracking-wide transition ${
              active
                ? "bg-[var(--gold)] font-semibold text-[#0b1c24]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {compact ? meta.short : meta.name}
          </button>
        );
      })}
    </div>
  );
}
