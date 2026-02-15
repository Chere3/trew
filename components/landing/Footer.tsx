import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Trew</p>
              <h3 className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">One plan. All models. Continuous context.</h3>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Stop managing stacked subscriptions. Work across providers in one stable, consistent environment.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-10 px-5 text-sm font-medium">
                <Link href="/register">Create Account</Link>
              </Button>
              <Button asChild variant="outline" className="h-10 px-5 text-sm font-medium">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Trew. All rights reserved.</p>
          <nav className="flex flex-wrap gap-2" aria-label="Footer">
            <Link
              className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
              href="/login"
            >
              Sign In
            </Link>
            <Link
              className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
              href="/pricing"
            >
              Pricing
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
