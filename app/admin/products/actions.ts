"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { savePdfFile, saveCoverImage } from "@/lib/storage";
import { slugify } from "@/lib/slug";

function readCommon(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceDollars = Number(formData.get("price") ?? 0);
  const pageCountRaw = String(formData.get("pageCount") ?? "").trim();
  const seasonId = String(formData.get("seasonId") ?? "").trim() || null;
  const categoryId = String(formData.get("categoryId") ?? "").trim() || null;
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";

  if (!title) throw new Error("Title is required.");
  if (!Number.isFinite(priceDollars) || priceDollars < 0) throw new Error("Price must be a positive number.");

  return {
    title,
    slug: slugify(slugInput || title),
    description,
    priceCents: Math.round(priceDollars * 100),
    pageCount: pageCountRaw ? Number(pageCountRaw) : null,
    seasonId,
    categoryId,
    featured,
    published,
  };
}

export async function createProduct(formData: FormData) {
  const data = readCommon(formData);

  const pdf = formData.get("pdf");
  const cover = formData.get("cover");
  if (!(pdf instanceof File) || pdf.size === 0) throw new Error("A PDF file is required.");
  if (!(cover instanceof File) || cover.size === 0) throw new Error("A cover image is required.");

  const filePath = await savePdfFile(pdf);
  const coverImage = await saveCoverImage(cover);

  await prisma.product.create({
    data: { ...data, filePath, coverImage },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true } as const;
}

export async function updateProduct(id: string, formData: FormData) {
  const data = readCommon(formData);

  const update: Record<string, unknown> = { ...data };

  const pdf = formData.get("pdf");
  if (pdf instanceof File && pdf.size > 0) {
    update.filePath = await savePdfFile(pdf);
  }
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    update.coverImage = await saveCoverImage(cover);
  }

  await prisma.product.update({ where: { id }, data: update });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true } as const;
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
