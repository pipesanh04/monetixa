"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useLocale();

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    localStorage.removeItem("mbx_serial");
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--gold)] hover:text-[var(--ink)]"
    >
      {t.dashboard.logout}
    </button>
  );
}
