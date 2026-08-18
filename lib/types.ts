export type SeasonSummary = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  discountPercent: number;
  startsAt: Date;
  endsAt: Date;
  active: boolean;
};

export type CategorySummary = {
  id: string;
  slug: string;
  name: string;
};

export type ProductWithRelations = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  coverImage: string;
  pageCount: number | null;
  featured: boolean;
  season: SeasonSummary | null;
  category: CategorySummary | null;
};
