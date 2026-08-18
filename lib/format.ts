export function formatPrice(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function isSeasonLive(startsAt: Date | string, endsAt: Date | string, now = new Date()) {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const t = now.getTime();
  return t >= start && t <= end;
}

export function isSeasonUpcoming(startsAt: Date | string, now = new Date()) {
  return new Date(startsAt).getTime() > now.getTime();
}

export function toDatetimeLocal(date: Date | string) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function discountedPriceCents(priceCents: number, discountPercent: number) {
  if (!discountPercent) return priceCents;
  return Math.max(0, Math.round(priceCents * (1 - discountPercent / 100)));
}
