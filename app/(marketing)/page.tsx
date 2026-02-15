import { Inter } from "next/font/google";
import { Hero, Testimonials, TrustIndicators, Features, Footer } from "@/components/landing";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-marketing",
  weight: ["400", "500", "600", "700"],
});

export default function Home() {
  return (
    <main
      className={`${inter.variable} flex-1 bg-background text-foreground [font-family:var(--font-marketing)]`}
    >
      <div>
        <Hero />
        <TrustIndicators />
        <Features />
        <Testimonials />
        <Footer />
      </div>
    </main>
  );
}
