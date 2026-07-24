"use client";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoutButton } from "@/components/LogoutButton";
import { AppVersion } from "@/components/AppVersion";
import { useLocale } from "@/i18n/LocaleProvider";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Monetixa";

export function DashboardHeader({ serial }: { serial: string }) {
  const { t } = useLocale();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 animate-fade-up">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--gold)]">
          {APP_NAME}
        </p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
          {t.dashboard.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {t.dashboard.session}{" "}
          <span className="text-[var(--ink)]">{serial}</span>
        </p>
        <div className="mt-3">
          <AppVersion />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <LanguageSwitcher compact />
        <LogoutButton />
      </div>
    </header>
  );
}

export function DashboardFooter() {
  const { t } = useLocale();

  return (
    <footer className="flex flex-col items-center gap-2 pb-6 text-center text-xs text-[var(--muted)]">
      <AppVersion compact />
      <p>{t.dashboard.footer}</p>
    </footer>
  );
}
