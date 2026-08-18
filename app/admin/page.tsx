import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, seasonCount, paidOrderCount, orders, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.season.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalCents: true } }),
  ]);

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Seasons", value: seasonCount, href: "/admin/seasons" },
    { label: "Paid orders", value: paidOrderCount, href: "/admin/orders" },
    { label: "Revenue (paid)", value: formatPrice(revenue._sum.totalCents ?? 0), href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent paid orders</h2>
          <Link href="/admin/orders" className="text-sm text-accent hover:underline">View all →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No paid orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{o.email}</td>
                    <td className="px-4 py-3">{o.items.length}</td>
                    <td className="px-4 py-3">{formatPrice(o.totalCents, o.currency)}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/admin/products/new" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">
          + New product
        </Link>
        <Link href="/admin/seasons/new" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:border-accent hover:text-accent">
          + New season
        </Link>
      </div>
    </div>
  );
}
