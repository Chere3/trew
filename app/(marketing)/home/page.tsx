import { LandingPageContent } from "./LandingPageContent";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <LandingPageContent isLoggedIn={!!session} />;
}