import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ChatInterface } from "@/app/(dashboard)/chat/ChatInterface";
import { LandingPageContent } from "@/app/(marketing)/home/LandingPageContent";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/landing/Footer";

export default async function RootPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    // Logged in: render chat page without Navbar
    return <ChatInterface />;
  } else {
    // Not logged in: render landing page with Navbar and Footer (marketing layout)
    return (
      <>
        <Navbar isLoggedIn={false} />
        <LandingPageContent isLoggedIn={false} />
        <Footer />
      </>
    );
  }
}