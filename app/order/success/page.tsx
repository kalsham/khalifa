import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/format";

async function loadOrder(sessionId: string) {
  let order = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: { items: { include: { product: true } } },
  });

  // Fallback for local/dev setups without a live Stripe webhook endpoint:
  // confirm payment directly with Stripe if our webhook hasn't landed yet.
  if (order && order.status !== "PAID") {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        order = await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
          include: { items: { include: { product: true } } },
        });
      }
    } catch {
      // Stripe not configured or lookup failed — leave order as-is.
    }
  }

  return order;
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Missing order</h1>
        <p className="mt-2 text-muted">We couldn&apos;t find a checkout session to look up.</p>
        <Link href="/shop" className="mt-6 inline-block text-accent hover:underline">Back to shop</Link>
      </div>
    );
  }

  const order = await loadOrder(sessionId);

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Order not found</h1>
        <p className="mt-2 text-muted">This checkout session doesn&apos;t match any order.</p>
        <Link href="/shop" className="mt-6 inline-block text-accent hover:underline">Back to shop</Link>
      </div>
    );
  }

  if (order.status !== "PAID") {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Finishing up your order…</h1>
        <p className="mt-2 text-muted">
          Payment is still processing. Refresh this page in a few seconds — your downloads will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold">Thank you! 🎉</h1>
        <p className="mt-2 text-muted">
          Your order is confirmed and a receipt was sent to <strong>{order.email}</strong>.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.product.coverImage} alt={item.product.title} className="h-20 w-16 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="font-medium">{item.product.title}</div>
              <div className="text-sm text-muted">{formatPrice(item.priceCents, order.currency)}</div>
            </div>
            <a
              href={`/download/${item.downloadToken}`}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:brightness-110"
            >
              Download PDF
            </a>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Keep this page or your email — each download link works up to 5 times.
      </p>
    </div>
  );
}
