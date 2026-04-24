// Results page, POC. Three real sarees for the JPMC profile
// (everyday office, Bangalore summer, ₹3000 budget). Wired by hand for now;
// rubric-driven selection comes later.

type Recommendation = {
  direction: string;
  reasoning: string;
  fabricLabel: string;
  productName: string;
  imageUrl: string;
  productUrl: string;
  retailer: string;
  priceInr: number;
};

const RECOMMENDATIONS: Recommendation[] = [
  {
    direction: 'the perfect office wear saree',
    reasoning:
      "chiffon is the lightest thing you can drape, barely a weight on you through a long day. this magenta carries itself, the ombre shifting softly as you move, enough punch for a monday meeting and enough calm to reach for again next week.",
    fabricLabel: 'magenta chiffon',
    productName: 'Magenta Chiffon Ombre Saree With Tassels',
    imageUrl:
      'https://www.soch.com/media/catalog/product/s/r/srcaplc109901c_05.jpg',
    productUrl:
      'https://www.soch.com/in/magenta-chiffon-ombre-print-saree-with-tassels-srcaplc109901c.html',
    retailer: 'Soch',
    priceInr: 1356,
  },
  {
    direction: 'for long bangalore afternoons',
    reasoning:
      "mulmul breathes the way nothing else does, the fabric you want when the afternoon runs from two to seven. this green is quiet, the kind that lets you look put-together without feeling dressed up. easy to wrap, easier to live in.",
    fabricLabel: 'soft green mulmul cotton',
    productName: 'Ode To Greens',
    imageUrl:
      'https://suta.in/cdn/shop/files/IMG_4908.jpg?v=1746612520&width=2048',
    productUrl: 'https://suta.in/products/ode-to-greens',
    retailer: 'Suta',
    priceInr: 2500,
  },
  {
    direction: 'office-to-evening without a change',
    reasoning:
      "chanderi has a soft shimmer baked in, reads gentle in daylight and picks up warmth in the evening without a thing changing on your end. this emerald does most of the work on its own, and the woven detail keeps it from feeling plain. for the day that might turn into dinner.",
    fabricLabel: 'emerald green chanderi',
    productName: 'Green Chanderi Woven Design Saree',
    imageUrl:
      'https://www.soch.com/media/catalog/product/g/r/green_chanderi_woven_design_saree_womens_soch-srevjq133987b_01.jpg',
    productUrl:
      'https://www.soch.com/in/green-chanderi-woven-design-saree-srevjq133987b.html',
    retailer: 'Soch',
    priceInr: 2399,
  },
];

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-16">
        <header className="mb-10 md:mb-14">
          <h1 className="font-serif text-3xl text-ink md:text-4xl">three for you</h1>
          <p className="mt-2 text-sm text-muted md:text-base">
            picked for everyday office wear in a bangalore summer.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3 md:gap-8">
          {RECOMMENDATIONS.map((r) => (
            <Card key={r.productUrl} rec={r} />
          ))}
        </section>
      </div>
    </main>
  );
}

function Card({ rec }: { rec: Recommendation }) {
  const formattedPrice = new Intl.NumberFormat('en-IN').format(rec.priceInr);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
      <div className="aspect-[4/5] overflow-hidden bg-muted/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={rec.imageUrl}
          alt={rec.productName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className="font-serif text-lg text-ink md:text-xl">{rec.direction}</h2>
        <p className="text-xs uppercase tracking-wide text-muted">{rec.fabricLabel}</p>
        <p className="text-sm leading-relaxed text-ink/80">{rec.reasoning}</p>

        <div className="mt-auto flex items-center justify-between border-t border-muted/15 pt-4">
          <div className="text-sm">
            <div className="text-muted">{rec.retailer}</div>
            <div className="font-semibold text-ink">₹{formattedPrice}</div>
          </div>
          <a
            href={rec.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded bg-bindi px-5 py-2 text-sm font-medium text-white transition hover:bg-bindi-deep"
          >
            Buy
          </a>
        </div>
      </div>
    </article>
  );
}
