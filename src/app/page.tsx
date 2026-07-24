import { redirect } from "next/navigation";
import { getSessionSerial } from "@/lib/auth";

export default async function HomePage() {
  const serial = await getSessionSerial();
  redirect(serial ? "/dashboard" : "/login");
}
