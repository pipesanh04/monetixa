"use client";

import { LoginForm } from "@/components/LoginForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/i18n/LocaleProvider";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Monetixa";

export function LoginPageView() {
  const { t } = useLocale();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,184,120,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(212,184,120,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />

      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <LanguageSwitcher compact />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center animate-fade-up">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold)]">
          {t.login.desk}
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-[var(--ink)] sm:text-6xl">
          {APP_NAME}
        </h1>
        <p className="mt-2 text-sm font-medium tracking-wide text-[var(--teal-soft)]">
          v{process.env.NEXT_PUBLIC_APP_VERSION || "—"} · update test
        </p>
        <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--muted)]">
          {t.login.tagline}
        </p>

        <div className="mt-10 w-full rounded-xl border border-[var(--line)] bg-[rgba(16,40,52,0.75)] p-6 shadow-[var(--shadow)] backdrop-blur-md sm:p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
