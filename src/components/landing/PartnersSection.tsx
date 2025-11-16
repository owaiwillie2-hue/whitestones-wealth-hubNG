export const PartnersSection = () => {
  const partners = [
    "Bloomberg", "Reuters", "Forbes", "Financial Times", "Wall Street Journal",
    "CNBC", "MarketWatch", "The Economist", "Business Insider", "Yahoo Finance"
  ];

  return (
    <section className="py-12 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground mb-8 text-sm uppercase tracking-wider">
          As Featured In
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {partners.map((partner) => (
            <div
              key={partner}
              className="text-muted-foreground/60 hover:text-primary transition-fast font-semibold text-lg"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};