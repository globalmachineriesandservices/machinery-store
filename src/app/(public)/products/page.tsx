import prisma from "@/lib/prisma";
import ProductsClient from "./ProductsClient";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const [allProducts, categories, brandRows] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, _count: { select: { reviews: true, inquiries: true } } },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.category.findMany({
      where: { active: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  const brands = brandRows.flatMap((b: { brand: string | null }) =>
    b.brand ? [b.brand] : []
  );

  return (
    <ProductsClient
      allProducts={JSON.parse(JSON.stringify(allProducts))}
      categories={JSON.parse(JSON.stringify(categories))}
      brands={brands}
    />
  );
}
