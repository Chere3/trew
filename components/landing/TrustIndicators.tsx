const metrics = [
  { label: "Teams onboarded", value: "50K+" },
  { label: "Daily model switches", value: "1.2M" },
  { label: "Average setup", value: "< 3 min" },
  { label: "Potential cost reduction", value: "Up to 60%" },
];

export function TrustIndicators() {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-7xl rounded-2xl border border-border bg-card p-4 sm:p-6">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-border bg-background px-4 py-5">
              <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{metric.label}</dt>
              <dd className="mt-2 text-2xl font-semibold leading-none tracking-[-0.02em] text-foreground">{metric.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
