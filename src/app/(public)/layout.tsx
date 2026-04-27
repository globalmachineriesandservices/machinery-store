import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import prisma from "@/lib/prisma";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [company, categories] = await Promise.all([
    prisma.companyDetails.findFirst(),
    prisma.category.findMany({ orderBy: { name: "asc" }, take: 10 }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        company={company ? JSON.parse(JSON.stringify(company)) : null}
        categories={JSON.parse(JSON.stringify(categories))}
      />
      <main className="flex-1">{children}</main>
      <Footer company={company ? JSON.parse(JSON.stringify(company)) : null} />
    </div>
  );
}
