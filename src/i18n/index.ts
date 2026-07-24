import type { Locale, Messages } from "./types";
import { DEFAULT_LOCALE, LOCALES } from "./types";
import es from "./messages/es";
import en from "./messages/en";
import fr from "./messages/fr";
import zh from "./messages/zh";

export { DEFAULT_LOCALE, LOCALES, LOCALE_META, LOCALE_STORAGE_KEY } from "./types";
export type { Locale, Messages } from "./types";

const catalog: Record<Locale, Messages> = { es, en, fr, zh };

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function getMessages(locale: Locale): Messages {
  return catalog[locale] ?? catalog[DEFAULT_LOCALE];
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`,
  );
}

export function mapAuthError(message: string | undefined, t: Messages): string {
  if (!message) return t.login.loginFailed;
  if (
    message.includes("serial válido") ||
    message.includes("valid serial") ||
    message.includes("série valide") ||
    message.includes("有效序列")
  ) {
    return t.authErrors.invalidSerial;
  }
  if (
    message.includes("no autorizado") ||
    message.includes("Unauthorized") ||
    message.includes("non autorisée") ||
    message.includes("未授权")
  ) {
    return t.authErrors.unauthorized;
  }
  return message;
}
