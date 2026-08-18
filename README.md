# Khalifa Market

A digital marketplace for printable PDFs (planners, worksheets, party kits) organized around
**seasonal campaigns** — Ramadan, Eid, back to school, summer, birthdays, and whatever's next.
Each campaign has its own themed landing page, countdown timer, and time-boxed discount.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS
- **Prisma 7** + SQLite (via `better-sqlite3` driver adapter) — swap the datasource for Postgres/MySQL in production
- **Stripe Checkout** for payment, with a signed tokenized `/download/[token]` route for delivery
- Local filesystem storage for uploads (`storage/products` for PDFs, `public/uploads` for cover art) — swap for S3/R2 in production
- A single hardcoded admin account (email + password in `.env`), sessions via a signed HTTP-only cookie

## Getting started

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema (also seeds data)
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin` for the admin panel.

Default admin login (change these in `.env` before deploying):

- Email: `admin@example.com`
- Password: `change-me-now`

The seed script (`prisma/seed.ts`, runs automatically after `prisma migrate dev`) creates 5 seasonal
campaigns and 12 sample products, including generated placeholder PDFs and cover art, so the store
is browsable immediately.

To re-run the seed manually: `npm run db:seed` (this wipes and recreates products/seasons/orders).

## Environment variables

See `.env.example`. The important ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file path (default `file:./dev.db`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Single admin login |
| `SESSION_SECRET` | Signs the admin session cookie — use a long random string in production |
| `STRIPE_SECRET_KEY` | From the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys), test mode |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` or your webhook endpoint settings |
| `NEXT_PUBLIC_SITE_URL` | Used to build Stripe success/cancel URLs |

### Stripe setup

1. Add your test **secret key** to `STRIPE_SECRET_KEY`.
2. For local development, forward webhooks with the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```
   and put the printed signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Without a webhook configured, checkout still works: the `/order/success` page falls back to
   verifying payment status directly with the Stripe API the first time a customer lands on it.

## How the seasonal system works

- Each `Season` has a start/end date, a gradient theme (`colorFrom`/`colorTo`), an emoji, and an
  optional discount percentage.
- A season is **live** when `now` falls between `startsAt` and `endsAt`. While live, its discount is
  applied automatically at checkout and shown on product cards.
- The homepage hero shows the live season ending soonest, with a countdown; other live campaigns get
  their own cards, and upcoming (not-yet-live) seasons get a teaser with a start-date countdown.
- Products link to at most one season and one category; unassign a season and the product just
  behaves like a regular catalog item.
- Admins manage seasons at `/admin/seasons` — create a new one before an event, set its date window
  and discount, and assign products to it. Nothing needs redeploying to launch or end a campaign.

## Order flow

1. Customer adds products to a cart (stored in `localStorage`, no account needed).
2. Checkout (`/api/checkout`) revalidates prices server-side (season discounts are recomputed, never
   trusted from the client), creates a `PENDING` `Order` + `OrderItem`s with unique download tokens,
   and creates a Stripe Checkout Session.
3. On payment, the Stripe webhook (or the success-page fallback) marks the order `PAID`.
4. `/order/success` lists each purchased item with a `/download/[token]` link. Each token allows up
   to 5 downloads and only works once its order is `PAID`.

## Known trade-offs (MVP scope)

- Single admin account, no roles/multi-user.
- Local filesystem storage — fine for one instance, not for multi-instance/serverless deployment.
- No email delivery is wired up (the success page **is** the delivery mechanism); add a transactional
  email step in the webhook handler for production.
- `npm audit` flags a transitive `deepmerge-ts` advisory pulled in by Prisma's dev-time config loader
  (`prisma.config.ts` tooling) — it's build-time only, not part of the running app, and fixing it
  would downgrade Prisma below the version this project's driver-adapter setup requires.
