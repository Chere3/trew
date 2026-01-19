import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/landing/Footer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <Navbar isLoggedIn={!!session} />
      {children}
      <Footer />
    </>
  );
}
