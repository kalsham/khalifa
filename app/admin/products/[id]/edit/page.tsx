import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../product-form";
import { updateProduct } from "../../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, seasons, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.season.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const boundAction = updateProduct.bind(null, product.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Edit product</h1>
      <ProductForm
        seasons={seasons}
        categories={categories}
        action={boundAction}
        initial={{
          title: product.title,
          slug: product.slug,
          description: product.description,
          priceCents: product.priceCents,
          pageCount: product.pageCount,
          seasonId: product.seasonId,
          categoryId: product.categoryId,
          featured: product.featured,
          published: product.published,
          coverImage: product.coverImage,
        }}
      />
    </div>
  );
}
