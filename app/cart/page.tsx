"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, remove, subtotalCents } = useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Enter your email so we can send your downloads.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productIds: items.map((i) => i.productId),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong starting checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not reach checkout. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Add a few printable PDFs to get started.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold">Your cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.coverImage} alt={item.title} className="h-20 w-16 shrink-0 rounded-lg object-cover" />
              <div className="flex-1">
                <Link href={`/product/${item.slug}`} className="font-medium hover:text-accent">
                  {item.title}
                </Link>
                <div className="text-sm text-muted">{formatPrice(item.priceCents, item.currency)}</div>
              </div>
              <button
                onClick={() => remove(item.productId)}
                className="text-sm text-muted hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-2xl border border-border bg-surface p-6">
          <div className="flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span>{formatPrice(subtotalCents)}</span>
          </div>
          <div className="mt-1 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotalCents)}</span>
          </div>

          <form onSubmit={handleCheckout} className="mt-6 flex flex-col gap-3">
            <label className="text-sm font-medium">
              Email for delivery
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Redirecting to checkout…" : "Checkout with Stripe"}
            </button>
            <p className="text-center text-xs text-muted">
              Secure payment via Stripe. Downloads unlock instantly after payment.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
