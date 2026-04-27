import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, Star, Package, MessageSquare, ImageIcon } from "lucide-react";

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" }, take: 5 },
      inquiries: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { reviews: true, inquiries: true } },
    },
  });

  if (!product) notFound();

  const specs = product.specifications as Record<string, string> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{product.name.toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/products/${id}/edit`}><Pencil className="w-4 h-4 mr-2" />Edit</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader><CardTitle className="text-base">Images</CardTitle></CardHeader>
            <CardContent>
              {product.images.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img: string, i: number) => (
                    <div key={i} className={`relative rounded-lg overflow-hidden border bg-muted ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                      <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="200px" />
                      {i === 0 && <span className="absolute top-2 left-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded">Main</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center bg-muted rounded-lg">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </CardContent>
          </Card>

          {/* Specifications */}
          {specs && Object.keys(specs).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Specifications</CardTitle></CardHeader>
              <CardContent>
                <div className="divide-y">
                  {Object.entries(specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5 text-sm">
                      <span className="font-medium text-muted-foreground">{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                <Badge variant={product.inStock ? "success" : "destructive"}>{product.inStock ? "In Stock" : "Out of Stock"}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Featured</span>
                {product.featured ? <Badge variant="warning"><Star className="w-3 h-3 mr-1 fill-current" />Yes</Badge> : <span>No</span>}
              </div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{product.category.name}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Reviews</span><span>{product._count.reviews}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Inquiries</span><span>{product._count.inquiries}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Added</span><span>{formatDate(product.createdAt)}</span></div>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full">
            <Link href={`/products/${product.slug}`} target="_blank">View on Site</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/admin/inquiries?productId=${product.id}`}><MessageSquare className="w-4 h-4 mr-2" />View Inquiries</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
