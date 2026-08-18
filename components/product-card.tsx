import Link from "next/link";
import { formatPrice, isSeasonLive, discountedPriceCents } from "@/lib/format";
import type { ProductWithRelations } from "@/lib/types";
import { AddToCartButton } from "@/components/add-to-cart-button";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const season = product.season;
  const live = season ? isSeasonLive(season.startsAt, season.endsAt) : false;
  const onSale = live && season && season.discountPercent > 0;
  const finalPrice = onSale ? discountedPriceCents(product.priceCents, season!.discountPercent) : product.priceCents;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-lg hover:shadow-black/5">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.coverImage}
          alt={product.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {season && (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow"
            style={{ background: `linear-gradient(135deg, ${season.colorFrom}, ${season.colorTo})` }}
          >
            {season.emoji} {season.name}
          </span>
        )}
        {onSale && (
          <span className="absolute right-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-xs font-semibold text-white">
            -{season!.discountPercent}%
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground group-hover:text-accent">
            {product.title}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm text-muted">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-foreground">{formatPrice(finalPrice, product.currency)}</span>
            {onSale && (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.priceCents, product.currency)}
              </span>
            )}
          </div>
          <AddToCartButton product={product} effectivePriceCents={finalPrice} variant="compact" />
        </div>
      </div>
    </div>
  );
}
