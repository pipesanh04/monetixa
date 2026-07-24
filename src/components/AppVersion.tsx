"use client";

import { useLocale } from "@/i18n/LocaleProvider";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "—";

type AppVersionProps = {
  className?: string;
  compact?: boolean;
};

export function AppVersion({ className = "", compact = false }: AppVersionProps) {
  const { t } = useLocale();

  if (compact) {
    return (
      <span className={`font-mono text-xs text-[var(--muted)] ${className}`}>
        v{APP_VERSION}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[rgba(7,20,26,0.45)] px-3 py-1.5 ${className}`}
    >
      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
        {t.dashboard.version}
      </span>
      <span className="font-mono text-sm font-semibold text-[var(--ink)]">
        v{APP_VERSION}
      </span>
    </div>
  );
}
