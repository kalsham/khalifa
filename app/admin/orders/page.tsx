import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Orders</h1>

      <div className="mt-6 space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium">{o.email}</div>
                <div className="text-xs text-muted">{formatDate(o.createdAt)}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatPrice(o.totalCents, o.currency)}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[o.status] ?? ""}`}>
                  {o.status}
                </span>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {o.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.product.title}</span>
                  <span>
                    {formatPrice(item.priceCents, o.currency)} · {item.downloadCount}/{item.maxDownloads} downloads
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {orders.length === 0 && <p className="text-muted">No orders yet.</p>}
      </div>
    </div>
  );
}
