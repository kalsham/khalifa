import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const PRODUCTS_DIR = path.join(process.cwd(), "storage", "products");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

async function makePlaceholderPdf(title: string, subtitle: string) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < 3; i++) {
    const page = doc.addPage([612, 792]);
    page.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: rgb(0.98, 0.97, 0.94) });
    page.drawText(title, { x: 56, y: 700, size: 26, font, color: rgb(0.13, 0.13, 0.15) });
    page.drawText(subtitle, { x: 56, y: 665, size: 13, font: bodyFont, color: rgb(0.4, 0.4, 0.42) });
    page.drawText(`Page ${i + 1} of 3 — sample preview content`, {
      x: 56,
      y: 60,
      size: 10,
      font: bodyFont,
      color: rgb(0.55, 0.55, 0.57),
    });
    page.drawRectangle({ x: 56, y: 550, width: 500, height: 1, color: rgb(0.85, 0.83, 0.78) });
  }
  return doc.save();
}

function coverSvg(title: string, colorFrom: string, colorTo: string, emoji: string) {
  const words = title.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > 16) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) lines.push(current);

  const textLines = lines
    .map((line, i) => `<text x="50%" y="${340 + i * 40}" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#ffffff" font-weight="700">${line}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorFrom}"/>
      <stop offset="100%" stop-color="${colorTo}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <circle cx="300" cy="200" r="90" fill="rgba(255,255,255,0.15)"/>
  <text x="50%" y="230" text-anchor="middle" font-size="80">${emoji}</text>
  ${textLines}
  <rect x="60" y="700" width="480" height="2" fill="rgba(255,255,255,0.35)"/>
  <text x="50%" y="750" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="rgba(255,255,255,0.85)">PDF Download</text>
</svg>`;
}

async function saveCover(filename: string, svg: string) {
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, filename), svg, "utf-8");
  return `/uploads/${filename}`;
}

async function savePdf(filename: string, bytes: Uint8Array) {
  await mkdir(PRODUCTS_DIR, { recursive: true });
  await writeFile(path.join(PRODUCTS_DIR, filename), bytes);
  return filename;
}

async function main() {
  console.log("Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.season.deleteMany();
  await prisma.category.deleteMany();

  const categories = await Promise.all(
    [
      { slug: "planners", name: "Planners" },
      { slug: "worksheets", name: "Worksheets" },
      { slug: "templates", name: "Templates" },
      { slug: "coloring-pages", name: "Coloring Pages" },
      { slug: "checklists", name: "Checklists" },
    ].map((c) => prisma.category.create({ data: c }))
  );
  const cat = (slug: string) => categories.find((c) => c.slug === slug)!.id;

  const now = new Date();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const seasons = [
    {
      slug: "summer",
      name: "Summer Fun",
      tagline: "Sun's out, planners out.",
      description:
        "Beat the heat with printable activity packs, travel planners, and bucket-list trackers made for long summer days.",
      emoji: "☀️",
      colorFrom: "#f59e0b",
      colorTo: "#0ea5e9",
      discountPercent: 20,
      startsAt: daysFromNow(-60),
      endsAt: daysFromNow(18),
    },
    {
      slug: "back-to-school",
      name: "Back to School",
      tagline: "Fresh notebook, fresh start.",
      description:
        "Homework trackers, class schedules, and study planners to make the new school year click from day one.",
      emoji: "🎒",
      colorFrom: "#2563eb",
      colorTo: "#f97316",
      discountPercent: 15,
      startsAt: daysFromNow(-8),
      endsAt: daysFromNow(28),
    },
    {
      slug: "ramadan",
      name: "Ramadan Reflections",
      tagline: "Plan your month of reflection.",
      description:
        "Prayer trackers, iftar planners, and daily reflection journals to make the most of the holy month.",
      emoji: "🌙",
      colorFrom: "#6d28d9",
      colorTo: "#c026d3",
      discountPercent: 25,
      startsAt: new Date("2027-02-18"),
      endsAt: new Date("2027-03-19"),
    },
    {
      slug: "eid",
      name: "Eid Celebration",
      tagline: "Party planning made joyful.",
      description:
        "Eid party planners, gift trackers, and decoration checklists to host a celebration everyone remembers.",
      emoji: "🎉",
      colorFrom: "#0d9488",
      colorTo: "#eab308",
      discountPercent: 20,
      startsAt: new Date("2027-03-20"),
      endsAt: new Date("2027-03-30"),
    },
    {
      slug: "birthday",
      name: "Birthday Bash",
      tagline: "Party planning, any day of the year.",
      description:
        "Guest lists, party timelines, and budget trackers — everything to throw a birthday to remember, any time of year.",
      emoji: "🎂",
      colorFrom: "#db2777",
      colorTo: "#7c3aed",
      discountPercent: 10,
      startsAt: daysFromNow(-365),
      endsAt: daysFromNow(365),
    },
  ];

  const createdSeasons = await Promise.all(seasons.map((s) => prisma.season.create({ data: s })));
  const season = (slug: string) => createdSeasons.find((s) => s.slug === slug)!;

  const products: {
    slug: string;
    title: string;
    description: string;
    priceCents: number;
    pageCount: number;
    seasonSlug: string;
    categorySlug: string;
    featured?: boolean;
  }[] = [
    {
      slug: "summer-bucket-list-planner",
      title: "Summer Bucket List Planner",
      description: "A 20-page printable planner packed with activity trackers, packing lists, and a summer calendar.",
      priceCents: 900,
      pageCount: 20,
      seasonSlug: "summer",
      categorySlug: "planners",
      featured: true,
    },
    {
      slug: "family-road-trip-kit",
      title: "Family Road Trip Kit",
      description: "Games, checklists, and a mileage tracker to keep everyone entertained on the road.",
      priceCents: 700,
      pageCount: 15,
      seasonSlug: "summer",
      categorySlug: "templates",
    },
    {
      slug: "summer-reading-log",
      title: "Kids Summer Reading Log",
      description: "A colorful reading log and reward chart to keep kids reading all summer long.",
      priceCents: 500,
      pageCount: 8,
      seasonSlug: "summer",
      categorySlug: "worksheets",
    },
    {
      slug: "class-schedule-planner",
      title: "Weekly Class Schedule Planner",
      description: "Color-coded weekly and semester schedule templates for students of any age.",
      priceCents: 600,
      pageCount: 12,
      seasonSlug: "back-to-school",
      categorySlug: "planners",
      featured: true,
    },
    {
      slug: "homework-tracker",
      title: "Homework & Assignment Tracker",
      description: "Never miss a deadline again with this printable assignment and grade tracker.",
      priceCents: 500,
      pageCount: 10,
      seasonSlug: "back-to-school",
      categorySlug: "checklists",
    },
    {
      slug: "school-supply-checklist",
      title: "School Supply Shopping Checklist",
      description: "A grade-by-grade supply checklist plus a budget tracker for back-to-school shopping.",
      priceCents: 400,
      pageCount: 6,
      seasonSlug: "back-to-school",
      categorySlug: "checklists",
    },
    {
      slug: "ramadan-daily-planner",
      title: "Ramadan Daily Planner",
      description: "Track prayers, Quran reading, fasting, and daily reflections across all 30 days.",
      priceCents: 1200,
      pageCount: 36,
      seasonSlug: "ramadan",
      categorySlug: "planners",
      featured: true,
    },
    {
      slug: "iftar-meal-planner",
      title: "Iftar Meal Planner & Grocery List",
      description: "Plan a month of iftar menus with a matching grocery list template.",
      priceCents: 800,
      pageCount: 14,
      seasonSlug: "ramadan",
      categorySlug: "templates",
    },
    {
      slug: "eid-party-planner",
      title: "Eid Party Planner",
      description: "Guest list, menu, decoration, and gift-tracking pages for a stress-free Eid celebration.",
      priceCents: 800,
      pageCount: 16,
      seasonSlug: "eid",
      categorySlug: "planners",
      featured: true,
    },
    {
      slug: "eid-gift-tracker",
      title: "Eidi & Gift Tracker",
      description: "Keep track of who's getting Eidi and gifts, with a budget column for every recipient.",
      priceCents: 400,
      pageCount: 6,
      seasonSlug: "eid",
      categorySlug: "checklists",
    },
    {
      slug: "birthday-party-planner",
      title: "Ultimate Birthday Party Planner",
      description: "A full party-planning kit: timeline, budget, guest list, and decoration checklist.",
      priceCents: 900,
      pageCount: 22,
      seasonSlug: "birthday",
      categorySlug: "planners",
      featured: true,
    },
    {
      slug: "birthday-coloring-pack",
      title: "Birthday Coloring Pack",
      description: "10 printable birthday-themed coloring pages for kids' party favors or quiet time.",
      priceCents: 500,
      pageCount: 10,
      seasonSlug: "birthday",
      categorySlug: "coloring-pages",
    },
  ];

  for (const p of products) {
    const s = season(p.seasonSlug);
    const pdfBytes = await makePlaceholderPdf(p.title, s.tagline);
    const filePath = await savePdf(`${p.slug}.pdf`, pdfBytes);
    const svg = coverSvg(p.title, s.colorFrom, s.colorTo, s.emoji);
    const coverImage = await saveCover(`${p.slug}.svg`, svg);

    await prisma.product.create({
      data: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        priceCents: p.priceCents,
        pageCount: p.pageCount,
        coverImage,
        filePath,
        featured: Boolean(p.featured),
        seasonId: s.id,
        categoryId: cat(p.categorySlug),
      },
    });
  }

  console.log(`Seeded ${createdSeasons.length} seasons and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
