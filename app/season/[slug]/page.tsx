import { notFound } from "next/navigation";
import { getSeasonBySlug, getProductsBySeason } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Countdown } from "@/components/countdown";
import { isSeasonLive, isSeasonUpcoming, formatDate } from "@/lib/format";

export default async function SeasonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const season = await getSeasonBySlug(slug);
  if (!season || !season.active) notFound();

  const products = await getProductsBySeason(season.id);
  const live = isSeasonLive(season.startsAt, season.endsAt);
  const upcoming = isSeasonUpcoming(season.startsAt);

  return (
    <div>
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${season.colorFrom}, ${season.colorTo})` }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-16 text-white">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
            {season.emoji} {live ? "Live now" : upcoming ? `Starts ${formatDate(season.startsAt)}` : "Collection"}
          </span>
          <h1 className="font-display max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            {season.name}
          </h1>
          <p className="max-w-xl text-white/85">{season.description}</p>
          <div className="flex flex-wrap items-center gap-4">
            {season.discountPercent > 0 && live && (
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground">
                {season.discountPercent}% off, automatically applied
              </span>
            )}
            {live && <Countdown target={season.endsAt} label="sale ends in" />}
            {upcoming && <Countdown target={season.startsAt} label="starts in" />}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        {products.length === 0 ? (
          <p className="text-muted">Products for this collection are coming soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
