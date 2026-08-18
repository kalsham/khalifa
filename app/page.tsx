import Link from "next/link";
import { getLiveSeasons, getUpcomingSeasons, getFeaturedProducts } from "@/lib/data";
import { Countdown } from "@/components/countdown";
import { ProductCard } from "@/components/product-card";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function HomePage() {
  const [liveSeasons, upcomingSeasons, featured] = await Promise.all([
    getLiveSeasons(),
    getUpcomingSeasons(),
    getFeaturedProducts(8),
  ]);

  const hero = liveSeasons[0];

  return (
    <div>
      {hero ? (
        <section
          className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${hero.colorFrom}, ${hero.colorTo})` }}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-20 text-white">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              {hero.emoji} Live campaign
            </span>
            <h1 className="font-display max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
              {hero.name}: {hero.tagline}
            </h1>
            <p className="max-w-xl text-white/85">{hero.description}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/season/${hero.slug}`}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:brightness-95"
              >
                Shop {hero.name} {hero.discountPercent > 0 ? `— ${hero.discountPercent}% off` : ""}
              </Link>
              <Countdown target={hero.endsAt} label="sale ends in" />
            </div>
          </div>
        </section>
      ) : (
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 text-center">
            <h1 className="font-display text-4xl font-semibold">Printable PDFs for every season</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Planners, worksheets, and party kits ready to download the moment you buy them.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              Shop all products
            </Link>
          </div>
        </section>
      )}

      {liveSeasons.length > 1 && (
        <section className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="font-display text-2xl font-semibold">Live campaigns</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveSeasons.map((s) => (
              <Link
                key={s.id}
                href={`/season/${s.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-border p-6 text-white transition hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${s.colorFrom}, ${s.colorTo})` }}
              >
                <div>
                  <div className="text-3xl">{s.emoji}</div>
                  <div className="font-display mt-2 text-xl font-semibold">{s.name}</div>
                  <p className="mt-1 text-sm text-white/85">{s.tagline}</p>
                </div>
                <div className="mt-6 text-sm font-medium text-white/90 group-hover:underline">
                  Shop the collection →
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Featured downloads</h2>
          <Link href="/shop" className="text-sm font-medium text-accent hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {upcomingSeasons.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <h2 className="font-display text-2xl font-semibold">Coming up</h2>
            <p className="mt-1 text-sm text-muted">Get notified when these seasonal collections go live.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {upcomingSeasons.map((s) => (
                <div key={s.id} className="rounded-2xl border border-border p-5">
                  <div className="text-2xl">{s.emoji}</div>
                  <div className="font-display mt-2 text-lg font-semibold">{s.name}</div>
                  <p className="mt-1 text-sm text-muted">Starts {formatDate(s.startsAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
