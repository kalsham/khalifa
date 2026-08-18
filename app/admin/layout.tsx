import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/seasons", label: "Seasons" },
    { href: "/admin/orders", label: "Orders" },
  ];

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl gap-8 px-5 py-10">
      <aside className="w-48 shrink-0">
        <div className="font-display text-lg font-semibold">Admin</div>
        <nav className="mt-6 flex flex-col gap-1 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-foreground/80 hover:bg-surface hover:text-accent"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <form action="/api/admin/logout" method="POST" className="mt-6">
          <button className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm text-muted hover:border-accent hover:text-accent">
            Log out
          </button>
        </form>
        <Link href="/" className="mt-2 block px-3 text-xs text-muted hover:text-accent">
          ← Back to store
        </Link>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
