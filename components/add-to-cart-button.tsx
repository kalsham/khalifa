"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { ProductWithRelations } from "@/lib/types";

export function AddToCartButton({
  product,
  effectivePriceCents,
  variant = "default",
}: {
  product: ProductWithRelations;
  effectivePriceCents: number;
  variant?: "default" | "compact";
}) {
  const { add, has } = useCart();
  const router = useRouter();
  const inCart = has(product.id);

  const item = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    coverImage: product.coverImage,
    priceCents: effectivePriceCents,
    currency: product.currency,
  };

  if (variant === "compact") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!inCart) add(item);
        }}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          inCart
            ? "bg-foreground/10 text-muted"
            : "bg-accent text-accent-foreground hover:brightness-110"
        }`}
      >
        {inCart ? "In cart" : "Add to cart"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => !inCart && add(item)}
        disabled={inCart}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-110 disabled:opacity-60"
      >
        {inCart ? "Added to cart" : "Add to cart"}
      </button>
      <button
        onClick={() => {
          if (!inCart) add(item);
          router.push("/cart");
        }}
        className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition hover:border-accent hover:text-accent"
      >
        Buy now
      </button>
    </div>
  );
}
