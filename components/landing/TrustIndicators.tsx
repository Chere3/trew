export function TrustIndicators() {
  const companies = [
    { name: "Google", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg" },
    { name: "Microsoft", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoft.svg" },
    { name: "Apple", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apple.svg" },
    { name: "Amazon", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazon.svg" },
    { name: "Meta", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/meta.svg" },
    { name: "Netflix", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/netflix.svg" },
    { name: "Tesla", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tesla.svg" },
    { name: "OpenAI", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openai.svg" },
    { name: "Stripe", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stripe.svg" },
    { name: "GitHub", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg" },
  ];

  return (
    <section className="relative border-y border-border/50 bg-gradient-to-b from-background to-muted/20 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 text-center">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Trusted by builders and teams at
            </p>
            <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full max-w-6xl">
            {companies.map((company, index) => (
              <div
                key={index}
                className="group relative flex items-center justify-center rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-xl hover:scale-105 hover:-translate-y-1"
              >
                <div className="relative w-full h-12 grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 dark:invert dark:opacity-70 dark:group-hover:opacity-100">
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
