import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { deleteSeason } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSeasonsPage() {
  const seasons = await prisma.season.findMany({
    orderBy: { startsAt: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Seasons</h1>
        <Link href="/admin/seasons/new" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">
          + New season
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {seasons.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${s.colorFrom}, ${s.colorTo})` }}>
              <div className="text-2xl">{s.emoji}</div>
              <div className="font-display text-lg font-semibold">{s.name}</div>
              <div className="text-sm text-white/85">{s.tagline}</div>
            </div>
            <div className="space-y-1 p-4 text-sm text-muted">
              <div>{formatDate(s.startsAt)} → {formatDate(s.endsAt)}</div>
              <div>{s.discountPercent}% discount · {s._count.products} products</div>
              <div>{s.active ? "Active" : "Hidden"}</div>
            </div>
            <div className="flex justify-end gap-3 border-t border-border p-3">
              <form
                action={async () => {
                  "use server";
                  await deleteSeason(s.id);
                }}
              >
                <button className="text-sm text-red-600 hover:underline">Delete</button>
              </form>
              <Link href={`/admin/seasons/${s.id}/edit`} className="text-sm text-accent hover:underline">
                Edit
              </Link>
            </div>
          </div>
        ))}
        {seasons.length === 0 && <p className="text-muted">No seasons yet.</p>}
      </div>
    </div>
  );
}
