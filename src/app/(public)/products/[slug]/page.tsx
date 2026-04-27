import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import ProductGallery from "./ProductGallery";
import InquiryForm from "./InquiryForm";
import ReviewSection from "./ReviewSection";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Star, CheckCircle, XCircle, Tag, Award } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";

interface KeyFeature { title: string; points: string[] }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true } });
  if (!product) return { title: "Product Not Found" };
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { reviews: true, inquiries: true } },
    },
  });

  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    include: { category: true, _count: { select: { reviews: true, inquiries: true } } },
    take: 3,
    orderBy: { featured: "desc" },
  });

  const avgRating = product.reviews.length
    ? product.reviews.reduce((sum: number, r: typeof product.reviews[0]) => sum + r.rating, 0) / product.reviews.length
    : 0;

  const specs = product.specifications as Record<string, string> | null;
  const keyFeatures = product.keyFeatures as KeyFeature[] | null;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/40 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href="/products" className="hover:text-foreground">Products</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href={`/products?categoryId=${product.categoryId}`} className="hover:text-foreground">{product.category.name}</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Gallery */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Category + Brand */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/products?categoryId=${product.categoryId}`}
                className="text-sm font-bold uppercase tracking-wider text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                <Tag className="w-3.5 h-3.5" />{product.category.name}
              </Link>
              {product.brand && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <Link
                    href={`/products?brand=${encodeURIComponent(product.brand)}`}
                    className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-muted-foreground" />
                    {product.brand}
                  </Link>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product._count.reviews} reviews)</span>
              </div>
            )}

            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.inStock ? (
                <Badge variant="success" className="gap-1"><CheckCircle className="w-3.5 h-3.5" />In Stock</Badge>
              ) : (
                <Badge variant="destructive" className="gap-1"><XCircle className="w-3.5 h-3.5" />Out of Stock</Badge>
              )}
              {product.featured && (
                <Badge className="bg-orange-500 text-white border-0 gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />Featured
                </Badge>
              )}
              {product.brand && (
                <Badge variant="outline" className="gap-1 font-semibold">
                  <Award className="w-3 h-3" />{product.brand}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* Technical Specifications — compact table in sidebar */}
            {specs && Object.keys(specs).length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Technical Specifications</h3>
                  <div className="rounded-xl border overflow-hidden text-sm">
                    {Object.entries(specs).map(([k, v], i) => (
                      <div key={k} className={`flex justify-between py-2 px-3 ${i % 2 === 0 ? "bg-muted/40" : "bg-background"}`}>
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium text-right ml-4">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Inquiry CTA */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <p className="font-bold text-sm mb-1">Interested in this product?</p>
              <p className="text-sm text-muted-foreground mb-4">
                Contact us for pricing, availability, and technical specifications.
              </p>
              <InquiryForm
                productId={product.id}
                productName={product.name}
                userId={session?.user?.id}
                userEmail={session?.user?.email}
                userName={session?.user?.name}
              />
            </div>
          </div>
        </div>

        {/* Key Features — full width below the fold */}
        {keyFeatures && keyFeatures.length > 0 && (
          <div className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                KEY FEATURES
              </h2>
              <div className="w-12 h-1 rounded-full mt-2" style={{ background: "hsl(var(--accent))" }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {keyFeatures.map((feat, i) => (
                <div key={i} className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-base mb-3 flex items-center gap-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.05rem" }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "hsl(var(--primary))" }}>
                      {i + 1}
                    </span>
                    {feat.title.toUpperCase()}
                  </h3>
                  <ul className="space-y-2">
                    {feat.points.map((point, pi) => (
                      <li key={pi} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <ReviewSection
          productId={product.id}
          reviews={JSON.parse(JSON.stringify(product.reviews))}
          isLoggedIn={!!session?.user}
          userId={session?.user?.id}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-extrabold mb-6" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              RELATED PRODUCTS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p: typeof relatedProducts[0], i: number) => (
                <ProductCard key={p.id} product={JSON.parse(JSON.stringify(p))} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
