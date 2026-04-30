import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AZ ChatGPT - Autorouter PoC",
  description: "Proof of concept: model manager with intelligent autorouter",
};

export default async function PocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/register");
  }

  return <>{children}</>;
}
