import { Hero, Testimonials, TrustIndicators, Features, Footer } from "@/components/landing";

export function LandingPageContent({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <main className="flex-1">
      <div>
        <Hero isLoggedIn={isLoggedIn} />
        <TrustIndicators />
        <Features />
        <Testimonials />
      </div>
    </main>
  );
}