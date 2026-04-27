import prisma from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return <ProductForm categories={JSON.parse(JSON.stringify(categories))} />;
}
