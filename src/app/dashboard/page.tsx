import { redirect } from "next/navigation";
import { getSessionSerial } from "@/lib/auth";
import { BanksStrip } from "@/components/BanksStrip";
import { PriceTicker } from "@/components/PriceTicker";
import { RetainedTokens } from "@/components/RetainedTokens";
import { BuybackWizard } from "@/components/BuybackWizard";
import {
  DashboardFooter,
  DashboardHeader,
} from "@/components/DashboardChrome";

export default async function DashboardPage() {
  const serial = await getSessionSerial();
  if (!serial) redirect("/login");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10">
      <DashboardHeader serial={serial} />
      <BanksStrip />
      <PriceTicker />
      <RetainedTokens />
      <BuybackWizard />
      <DashboardFooter />
    </main>
  );
}
