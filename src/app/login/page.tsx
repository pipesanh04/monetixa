import { redirect } from "next/navigation";
import { getSessionSerial } from "@/lib/auth";
import { LoginPageView } from "@/components/LoginPageView";

export default async function LoginPage() {
  const serial = await getSessionSerial();
  if (serial) redirect("/dashboard");

  return <LoginPageView />;
}
