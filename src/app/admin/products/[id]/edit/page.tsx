import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      categories={JSON.parse(JSON.stringify(categories))}
      product={JSON.parse(JSON.stringify(product))}
    />
  );
}
