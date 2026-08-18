import { prisma } from "@/lib/prisma";
import { ProductForm } from "../product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const [seasons, categories] = await Promise.all([
    prisma.season.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">New product</h1>
      <ProductForm seasons={seasons} categories={categories} action={createProduct} />
    </div>
  );
}
