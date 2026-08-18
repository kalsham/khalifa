import { prisma } from "@/lib/prisma";

export async function getNavSeasons() {
  return prisma.season.findMany({
    where: { active: true },
    orderBy: { startsAt: "asc" },
  });
}

export async function getLiveSeasons() {
  const now = new Date();
  return prisma.season.findMany({
    where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { endsAt: "asc" },
  });
}

export async function getUpcomingSeasons(limit = 3) {
  const now = new Date();
  return prisma.season.findMany({
    where: { active: true, startsAt: { gt: now } },
    orderBy: { startsAt: "asc" },
    take: limit,
  });
}

export async function getSeasonBySlug(slug: string) {
  return prisma.season.findUnique({ where: { slug } });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { published: true, featured: true },
    include: { season: true, category: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { season: true, category: true },
  });
}

export async function getProductsBySeason(seasonId: string) {
  return prisma.product.findMany({
    where: { published: true, seasonId },
    include: { season: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getAllSeasons() {
  return prisma.season.findMany({ orderBy: { startsAt: "asc" } });
}

export async function getProducts(filters: { seasonSlug?: string; categorySlug?: string; q?: string }) {
  return prisma.product.findMany({
    where: {
      published: true,
      season: filters.seasonSlug ? { slug: filters.seasonSlug } : undefined,
      category: filters.categorySlug ? { slug: filters.categorySlug } : undefined,
      title: filters.q ? { contains: filters.q } : undefined,
    },
    include: { season: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}
