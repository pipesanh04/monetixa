import type { Metadata } from "next";
import { Noto_Sans_SC, Outfit } from "next/font/google";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-cjk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Monetixa";

export const metadata: Metadata = {
  title: `${appName} · Buyback institucional`,
  description:
    "Plataforma de monetización y buyback de tokens con precios de mercado en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${outfit.variable} ${notoSansSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-outfit)]">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
