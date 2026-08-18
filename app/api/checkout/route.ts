import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { discountedPriceCents, isSeasonLive } from "@/lib/format";

export async function POST(req: NextRequest) {
  let body: { email?: string; productIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim();
  const productIds = Array.isArray(body.productIds) ? [...new Set(body.productIds)] : [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (productIds.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, published: true },
    include: { season: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "One or more items are no longer available." }, { status: 400 });
  }

  const currency = products[0].currency;
  if (products.some((p) => p.currency !== currency)) {
    return NextResponse.json({ error: "Cart items must share a single currency." }, { status: 400 });
  }

  const priced = products.map((p) => {
    const live = p.season ? isSeasonLive(p.season.startsAt, p.season.endsAt) : false;
    const finalPrice =
      live && p.season && p.season.discountPercent > 0
        ? discountedPriceCents(p.priceCents, p.season.discountPercent)
        : p.priceCents;
    return { product: p, finalPrice };
  });

  const totalCents = priced.reduce((sum, p) => sum + p.finalPrice, 0);

  const order = await prisma.order.create({
    data: {
      email,
      totalCents,
      currency,
      status: "PENDING",
      items: {
        create: priced.map(({ product, finalPrice }) => ({
          productId: product.id,
          priceCents: finalPrice,
          downloadToken: nanoid(24),
        })),
      },
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      line_items: priced.map(({ product, finalPrice }) => ({
        quantity: 1,
        price_data: {
          currency,
          unit_amount: finalPrice,
          product_data: {
            name: product.title,
            description: product.description.slice(0, 300),
          },
        },
      })),
      success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    const message = err instanceof Error ? err.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
