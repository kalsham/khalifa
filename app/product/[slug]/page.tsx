import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getProductsBySeason } from "@/lib/data";
import { formatPrice, isSeasonLive, discountedPriceCents } from "@/lib/format";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.published) notFound();

  const season = product.season;
  const live = season ? isSeasonLive(season.startsAt, season.endsAt) : false;
  const onSale = live && season && season.discountPercent > 0;
  const finalPrice = onSale ? discountedPriceCents(product.priceCents, season!.discountPercent) : product.priceCents;

  const related = season
    ? (await getProductsBySeason(season.id)).filter((p) => p.id !== product.id).slice(0, 3)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="text-sm text-muted">
        <Link href="/shop" className="hover:text-accent">Shop</Link>
        {season && (
          <>
            {" / "}
            <Link href={`/season/${season.slug}`} className="hover:text-accent">
              {season.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.title}</span>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.coverImage} alt={product.title} className="w-full object-cover" />
        </div>

        <div>
          {season && (
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${season.colorFrom}, ${season.colorTo})` }}
            >
              {season.emoji} {season.name}
            </span>
          )}
          <h1 className="font-display mt-3 text-3xl font-semibold">{product.title}</h1>
          {product.category && <p className="mt-1 text-sm text-muted">{product.category.name}</p>}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPrice(finalPrice, product.currency)}</span>
            {onSale && (
              <span className="text-lg text-muted line-through">
                {formatPrice(product.priceCents, product.currency)}
              </span>
            )}
            {onSale && (
              <span className="rounded-full bg-black/80 px-2.5 py-1 text-xs font-semibold text-white">
                -{season!.discountPercent}%
              </span>
            )}
          </div>

          <p className="mt-5 text-foreground/80">{product.description}</p>

          {product.pageCount && (
            <p className="mt-3 text-sm text-muted">{product.pageCount} pages · Instant PDF download</p>
          )}

          <div className="mt-6">
            <AddToCartButton product={product} effectivePriceCents={finalPrice} />
          </div>

          <ul className="mt-8 space-y-2 text-sm text-muted">
            <li>✓ Delivered instantly by email after checkout</li>
            <li>✓ Print at home or at any copy shop</li>
            <li>✓ Digital product — no physical shipping</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold">More from {season?.name}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
