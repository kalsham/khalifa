import Link from "next/link";
import { getProducts, getAllSeasons, getCategories } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

export const revalidate = 60;

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const seasonSlug = typeof sp.season === "string" ? sp.season : undefined;
  const categorySlug = typeof sp.category === "string" ? sp.category : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const [products, seasons, categories] = await Promise.all([
    getProducts({ seasonSlug, categorySlug, q }),
    getAllSeasons(),
    getCategories(),
  ]);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const next = { season: seasonSlug, category: categorySlug, q, ...overrides };
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold">Shop all PDFs</h1>
        <p className="text-muted">{products.length} product{products.length === 1 ? "" : "s"} available</p>
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Season</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link
                  href={buildHref({ season: undefined })}
                  className={!seasonSlug ? "font-semibold text-accent" : "text-foreground/80 hover:text-accent"}
                >
                  All seasons
                </Link>
              </li>
              {seasons.map((s) => (
                <li key={s.id}>
                  <Link
                    href={buildHref({ season: s.slug })}
                    className={
                      seasonSlug === s.slug ? "font-semibold text-accent" : "text-foreground/80 hover:text-accent"
                    }
                  >
                    {s.emoji} {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Category</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link
                  href={buildHref({ category: undefined })}
                  className={!categorySlug ? "font-semibold text-accent" : "text-foreground/80 hover:text-accent"}
                >
                  All categories
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildHref({ category: c.slug })}
                    className={
                      categorySlug === c.slug ? "font-semibold text-accent" : "text-foreground/80 hover:text-accent"
                    }
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <p className="text-muted">No products match these filters yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
