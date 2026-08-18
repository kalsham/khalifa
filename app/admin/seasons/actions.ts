"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

function readCommon(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "✨").trim() || "✨";
  const colorFrom = String(formData.get("colorFrom") ?? "#f59e0b").trim();
  const colorTo = String(formData.get("colorTo") ?? "#ea580c").trim();
  const discountPercent = Number(formData.get("discountPercent") ?? 0);
  const startsAtRaw = String(formData.get("startsAt") ?? "");
  const endsAtRaw = String(formData.get("endsAt") ?? "");
  const active = formData.get("active") === "on";

  if (!name) throw new Error("Name is required.");
  if (!startsAtRaw || !endsAtRaw) throw new Error("Start and end dates are required.");

  const startsAt = new Date(startsAtRaw);
  const endsAt = new Date(endsAtRaw);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new Error("Invalid dates.");
  }
  if (endsAt <= startsAt) throw new Error("End date must be after the start date.");
  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    throw new Error("Discount must be between 0 and 100.");
  }

  return {
    name,
    slug: slugify(slugInput || name),
    tagline,
    description,
    emoji,
    colorFrom,
    colorTo,
    discountPercent: Math.round(discountPercent),
    startsAt,
    endsAt,
    active,
  };
}

export async function createSeason(formData: FormData) {
  const data = readCommon(formData);
  await prisma.season.create({ data });
  revalidatePath("/admin/seasons");
  revalidatePath("/");
  return { ok: true } as const;
}

export async function updateSeason(id: string, formData: FormData) {
  const data = readCommon(formData);
  await prisma.season.update({ where: { id }, data });
  revalidatePath("/admin/seasons");
  revalidatePath("/");
  return { ok: true } as const;
}

export async function deleteSeason(id: string) {
  await prisma.product.updateMany({ where: { seasonId: id }, data: { seasonId: null } });
  await prisma.season.delete({ where: { id } });
  revalidatePath("/admin/seasons");
  revalidatePath("/");
}
