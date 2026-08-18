"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

type NavSeason = { slug: string; name: string; emoji: string };

export function SiteHeader({ seasons }: { seasons: NavSeason[] }) {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
          Khalifa <span className="text-accent">Market</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex">
          <Link href="/shop" className={pathname === "/shop" ? "text-accent" : "hover:text-accent"}>
            Shop All
          </Link>
          {seasons.map((s) => (
            <Link
              key={s.slug}
              href={`/season/${s.slug}`}
              className={
                pathname === `/season/${s.slug}` ? "text-accent" : "hover:text-accent"
              }
            >
              {s.emoji} {s.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            Cart
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-full border border-border p-2 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border bg-surface px-5 py-3 text-sm font-medium md:hidden">
          <Link href="/shop" onClick={() => setOpen(false)} className="py-2">
            Shop All
          </Link>
          {seasons.map((s) => (
            <Link key={s.slug} href={`/season/${s.slug}`} onClick={() => setOpen(false)} className="py-2">
              {s.emoji} {s.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
