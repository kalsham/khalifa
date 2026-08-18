import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toDatetimeLocal } from "@/lib/format";
import { SeasonForm } from "../../season-form";
import { updateSeason } from "../../actions";

export default async function EditSeasonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const season = await prisma.season.findUnique({ where: { id } });
  if (!season) notFound();

  const boundAction = updateSeason.bind(null, season.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Edit season</h1>
      <SeasonForm
        action={boundAction}
        initial={{
          name: season.name,
          slug: season.slug,
          tagline: season.tagline,
          description: season.description,
          emoji: season.emoji,
          colorFrom: season.colorFrom,
          colorTo: season.colorTo,
          discountPercent: season.discountPercent,
          startsAt: toDatetimeLocal(season.startsAt),
          endsAt: toDatetimeLocal(season.endsAt),
          active: season.active,
        }}
      />
    </div>
  );
}
