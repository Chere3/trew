import { Hero, Testimonials, TrustIndicators, Features, Footer } from "@/components/landing";

export default function Home() {
  return (
    <main className="flex-1">
      <div>
        <Hero />
        <TrustIndicators />
        <Features />
        <Testimonials />
      </div>

     
    </main>

  );
}
