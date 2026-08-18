import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="font-display text-xl font-semibold">
            Khalifa <span className="text-accent">Market</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            Printable PDF planners, worksheets, and party kits built around the events people
            actually plan for — Ramadan, Eid, back to school, summer, and birthdays.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          <div>
            <div className="font-medium text-foreground">Shop</div>
            <ul className="mt-2 space-y-1 text-muted">
              <li><Link href="/shop" className="hover:text-accent">All products</Link></li>
              <li><Link href="/season/ramadan" className="hover:text-accent">Ramadan</Link></li>
              <li><Link href="/season/summer" className="hover:text-accent">Summer</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-foreground">Store</div>
            <ul className="mt-2 space-y-1 text-muted">
              <li><Link href="/cart" className="hover:text-accent">Cart</Link></li>
              <li><Link href="/admin" className="hover:text-accent">Admin</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-5 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Khalifa Market. Instant digital downloads, delivered by email.
      </div>
    </footer>
  );
}
