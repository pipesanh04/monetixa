"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { mapAuthError } from "@/i18n";
import { useLocale } from "@/i18n/LocaleProvider";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Monetixa";

export function LoginForm() {
  const router = useRouter();
  const { t, format } = useLocale();
  const [serial, setSerial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(mapAuthError(data.error, t) || t.login.loginFailed);
        return;
      }
      localStorage.setItem("mbx_serial", serial.trim());
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t.login.connectionError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="serial"
          className="block text-sm tracking-wide text-[var(--muted)]"
        >
          {t.login.serialLabel}
        </label>
        <input
          id="serial"
          name="serial"
          autoComplete="off"
          spellCheck={false}
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          placeholder={t.login.serialPlaceholder}
          className="w-full rounded-md border border-[var(--line)] bg-[rgba(7,20,26,0.55)] px-4 py-3.5 text-[var(--ink)] outline-none transition focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
        />
      </div>

      {error && (
        <p className="rounded-md border border-[rgba(196,92,74,0.4)] bg-[rgba(196,92,74,0.12)] px-3 py-2 text-sm text-[#f0c4bc]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !serial.trim()}
        className="w-full rounded-md bg-[var(--gold)] px-4 py-3.5 text-base font-semibold tracking-wide text-[#0b1c24] transition hover:bg-[var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? t.login.verifying
          : format(t.login.enter, { app: APP_NAME })}
      </button>

      <p className="text-center text-xs leading-relaxed text-[var(--muted)]">
        {t.login.footnote}
      </p>
    </form>
  );
}
